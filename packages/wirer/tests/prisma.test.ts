import { describe, expect, it } from 'vitest'
import {
  buildModelRegistry,
  emitDjangoModels,
  emitSqlAlchemyModels,
  pairAcrossFiles,
  parsePrismaSchema,
} from '../src/db/prisma.js'

describe('parsePrismaSchema', () => {
  it('parses a single model with mixed field types and attrs', () => {
    const src = `
model Order {
  id            String   @id @default(uuid())
  customerId    String
  total         Decimal  @db.Decimal(10, 2)
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("orders")
  @@index([customerId])
}
`
    const models = parsePrismaSchema(src)
    expect(models).toHaveLength(1)
    const m = models[0]
    expect(m.name).toBe('Order')
    expect(m.fields.map((f) => f.name)).toEqual([
      'id',
      'customerId',
      'total',
      'notes',
      'createdAt',
      'updatedAt',
    ])
    expect(m.fields[3].isOptional).toBe(true) // notes String?
    expect(m.blockAttrs.find((a) => a.name === 'map')?.args[0]).toBe('"orders"')
    expect(m.blockAttrs.find((a) => a.name === 'index')?.args[0]).toBe('[customerId]')
  })

  it('strips // and /* */ comments', () => {
    const src = `
// top comment
model X {
  id String @id @default(cuid()) // inline
  /* multi
     line */
  name String
}
`
    const models = parsePrismaSchema(src)
    expect(models[0].fields.map((f) => f.name)).toEqual(['id', 'name'])
  })

  it('handles multiple models', () => {
    const src = `
model A { id String @id @default(uuid()) }
model B { id String @id @default(uuid()) value Int }
`
    const models = parsePrismaSchema(src)
    expect(models.map((m) => m.name)).toEqual(['A', 'B'])
  })
})

describe('emitDjangoModels', () => {
  it('translates basic types + Meta.db_table + Meta.indexes', () => {
    const src = `
model Order {
  id            String   @id @default(uuid())
  customerId    String
  total         Decimal  @db.Decimal(10, 2)
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("orders")
  @@index([customerId])
}
`
    const py = emitDjangoModels(parsePrismaSchema(src))
    expect(py).toContain('import uuid')
    expect(py).toContain('class Order(models.Model):')
    expect(py).toContain('id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False')
    // camelCase -> snake_case
    expect(py).toContain('customer_id = models.CharField(')
    expect(py).toContain('db_column="customerId"')
    expect(py).toContain('models.DecimalField(max_digits=10, decimal_places=2')
    expect(py).toContain('notes = models.CharField(max_length=255, null=True, blank=True)')
    expect(py).toContain('created_at = models.DateTimeField(auto_now_add=True')
    expect(py).toContain('updated_at = models.DateTimeField(auto_now=True')
    expect(py).toContain('class Meta:')
    expect(py).toContain('db_table = "orders"')
    expect(py).toContain('models.Index(fields=["customer_id"])')
  })

  it('translates Boolean defaults + Json + @db.Text + @db.VarChar', () => {
    const src = `
model Item {
  id          String   @id @default(uuid())
  name        String   @db.VarChar(64)
  description String   @db.Text
  available   Boolean  @default(true)
  flagged     Boolean  @default(false)
  payload     Json
  qty         Int      @default(0)

  @@map("items")
}
`
    const py = emitDjangoModels(parsePrismaSchema(src))
    expect(py).toContain('name = models.CharField(max_length=64)')
    expect(py).toContain('description = models.TextField()')
    expect(py).toContain('available = models.BooleanField(default=True)')
    expect(py).toContain('flagged = models.BooleanField(default=False)')
    expect(py).toContain('payload = models.JSONField()')
    expect(py).toContain('qty = models.IntegerField(default=0)')
  })

  it('emits UniqueConstraint for @@unique', () => {
    const src = `
model Link {
  id        String  @id @default(uuid())
  provider  String
  subject   String

  @@unique([provider, subject])
  @@map("oauth_links")
}
`
    const py = emitDjangoModels(parsePrismaSchema(src))
    expect(py).toContain('models.UniqueConstraint(fields=["provider", "subject"]')
    expect(py).toContain('name="uniq_provider_subject"')
  })
})

describe('emitSqlAlchemyModels', () => {
  it('translates basic types + Mapped[] + __tablename__ + indexes', () => {
    const src = `
model Order {
  id            String   @id @default(uuid())
  customerId    String
  total         Decimal  @db.Decimal(10, 2)
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("orders")
  @@index([customerId])
}
`
    const py = emitSqlAlchemyModels(parsePrismaSchema(src))
    expect(py).toContain('from datetime import datetime, timezone')
    expect(py).toContain('from decimal import Decimal')
    expect(py).toContain('from uuid import uuid4')
    expect(py).toContain('from sqlalchemy import')
    expect(py).toContain('from sqlalchemy.orm import Mapped, mapped_column')
    expect(py).toContain('from app.database import Base')
    expect(py).toContain('def _utcnow() -> datetime:')
    expect(py).toContain('class Order(Base):')
    expect(py).toContain('__tablename__ = "orders"')
    expect(py).toContain('default=lambda: str(uuid4())')
    expect(py).toContain('index=True')
    expect(py).toContain('total: Mapped[Decimal] = mapped_column(Numeric(10, 2)')
    expect(py).toContain('notes: Mapped[str | None] = mapped_column')
    expect(py).toContain(', nullable=True)')
    expect(py).toContain('default=_utcnow')
    expect(py).toContain('onupdate=_utcnow')
  })

  it('multi-column @@index → __table_args__ Index() entry', () => {
    const src = `
model Link {
  id        String  @id @default(uuid())
  provider  String
  subject   String

  @@index([provider, subject])
  @@map("oauth_links")
}
`
    const py = emitSqlAlchemyModels(parsePrismaSchema(src))
    expect(py).toContain('__table_args__ = (')
    expect(py).toContain(
      'Index("ix_provider_subject", "provider", "subject"),',
    )
  })

  it('@@unique → __table_args__ Index(unique=True)', () => {
    const src = `
model Link {
  id        String  @id @default(uuid())
  provider  String
  subject   String

  @@unique([provider, subject])
  @@map("oauth_links")
}
`
    const py = emitSqlAlchemyModels(parsePrismaSchema(src))
    expect(py).toContain(
      'Index("uq_provider_subject", "provider", "subject", unique=True),',
    )
  })

  it('Boolean defaults + Json + @db.Text + @db.VarChar(N)', () => {
    const src = `
model Item {
  id          String   @id @default(uuid())
  name        String   @db.VarChar(64)
  description String   @db.Text
  available   Boolean  @default(true)
  qty         Int      @default(0)
  payload     Json

  @@map("items")
}
`
    const py = emitSqlAlchemyModels(parsePrismaSchema(src))
    expect(py).toContain('name: Mapped[str] = mapped_column(String(64))')
    expect(py).toContain('description: Mapped[str] = mapped_column(Text)')
    expect(py).toContain('available: Mapped[bool] = mapped_column(Boolean, default=True)')
    expect(py).toContain('qty: Mapped[int] = mapped_column(Integer, default=0)')
    expect(py).toContain('payload: Mapped[dict] = mapped_column(JSON)')
  })
})

describe('FK / @relation support', () => {
  const SCHEMA_WITH_FK = `
model User {
  id    String  @id @default(uuid())
  email String  @unique
  @@map("users")
}

model Order {
  id          String  @id @default(uuid())
  customerId  String
  customer    User    @relation(fields: [customerId], references: [id], onDelete: Cascade)
  total       Decimal @db.Decimal(10, 2)
  @@map("orders")
}

model OrderItem {
  id      String  @id @default(uuid())
  orderId String
  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  qty     Int
  @@map("order_items")
}
`

  describe('parser', () => {
    it('drops the relation field from columns + tags the FK scalar', () => {
      const models = parsePrismaSchema(SCHEMA_WITH_FK)
      const order = models.find((m) => m.name === 'Order')!
      const fieldNames = order.fields.map((f) => f.name)
      // The virtual `customer` accessor is dropped from the column list...
      expect(fieldNames).not.toContain('customer')
      // ...but the scalar `customerId` survives + carries the fk annotation.
      expect(fieldNames).toContain('customerId')
      const cid = order.fields.find((f) => f.name === 'customerId')!
      expect(cid.fk).toMatchObject({
        targetModel: 'User',
        targetColumn: 'id',
        onDelete: 'Cascade',
        optional: false,
        forwardFieldName: 'customer',
      })
    })

    it('handles optional relations + missing onDelete', () => {
      const src = `
model Profile {
  id        String  @id @default(uuid())
  ownerId   String?
  owner     User?   @relation(fields: [ownerId], references: [id])
}
`
      const profile = parsePrismaSchema(src)[0]
      const owner = profile.fields.find((f) => f.name === 'ownerId')!
      expect(owner.fk?.optional).toBe(true)
      expect(owner.fk?.onDelete).toBe('NoAction')
    })
  })

  describe('django emitter', () => {
    it('promotes FK scalar to ForeignKey with on_delete + db_column', () => {
      const py = emitDjangoModels(parsePrismaSchema(SCHEMA_WITH_FK))
      // The scalar `customerId` becomes a ForeignKey field named
      // `customer_id` (snake), pointing at "User", on_delete=CASCADE,
      // db_column kept as the original camelCase for round-trip safety.
      expect(py).toContain(
        'customer_id = models.ForeignKey(to="User", on_delete=models.CASCADE, related_name="+", db_column="customerId")',
      )
      // The `customer` virtual accessor is NOT emitted as its own field.
      expect(py).not.toMatch(/^\s+customer = models/m)
    })

    it('maps Prisma onDelete enum to Django constants', () => {
      const src = `
model A {
  id      String @id @default(uuid())
  bId     String
  b       B      @relation(fields: [bId], references: [id], onDelete: SetNull)
}
model B { id String @id @default(uuid()) }
`
      const py = emitDjangoModels(parsePrismaSchema(src))
      expect(py).toContain('on_delete=models.SET_NULL')
    })
  })

  describe('sqlalchemy emitter', () => {
    it('adds ForeignKey constraint on the FK column + imports it', () => {
      const py = emitSqlAlchemyModels(parsePrismaSchema(SCHEMA_WITH_FK))
      expect(py).toContain('from sqlalchemy import ForeignKey')
      // FK column gets a ForeignKey() arg pointing at <table>.<col>
      expect(py).toContain('ForeignKey("users.id")')
      // OrderItem.order_id → orders.id
      expect(py).toContain('ForeignKey("orders.id")')
    })

    it('does not import ForeignKey when the schema has no relations', () => {
      const src = `
model X {
  id String @id @default(uuid())
  name String
}
`
      const py = emitSqlAlchemyModels(parsePrismaSchema(src))
      expect(py).not.toContain('ForeignKey')
    })
  })
})

describe('cross-file model registry', () => {
  const USER_SCHEMA = `
model User {
  id    String @id @default(uuid())
  email String @unique
  @@map("users")
}
`
  const ORDERS_SCHEMA = `
model Order {
  id          String  @id @default(uuid())
  customerId  String
  customer    User    @relation(fields: [customerId], references: [id], onDelete: Cascade)
  total       Decimal @db.Decimal(10, 2)
}
`

  it('builds {Model -> {tableName, pythonPkg, sourceModuleId}} from per-module schemas', () => {
    const registry = buildModelRegistry([
      {
        moduleId: 'auth-core',
        pythonPkg: 'auth_core',
        models: parsePrismaSchema(USER_SCHEMA),
      },
      {
        moduleId: 'orders',
        pythonPkg: 'orders',
        models: parsePrismaSchema(ORDERS_SCHEMA),
      },
    ])
    expect(registry.get('User')).toEqual({
      tableName: 'users',
      sourceModuleId: 'auth-core',
      pythonPkg: 'auth_core',
    })
    expect(registry.get('Order')).toEqual({
      tableName: 'orders',
      sourceModuleId: 'orders',
      pythonPkg: 'orders',
    })
  })

  it('django emitter uses registry for cross-module FK target', () => {
    const registry = buildModelRegistry([
      {
        moduleId: 'auth-core',
        pythonPkg: 'auth_core',
        models: parsePrismaSchema(USER_SCHEMA),
      },
    ])
    const py = emitDjangoModels(parsePrismaSchema(ORDERS_SCHEMA), registry)
    expect(py).toContain('to="auth_core.User"')
  })

  it('django emitter falls back to bare model name when registry misses', () => {
    const py = emitDjangoModels(parsePrismaSchema(ORDERS_SCHEMA))
    expect(py).toContain('to="User"')
  })

  it('sqlalchemy emitter honours non-default @@map via registry', () => {
    const odd = `
model Customer {
  id String @id @default(uuid())
  email String @unique
  @@map("crm_customers")
}
`
    const ords = `
model Invoice {
  id          String   @id @default(uuid())
  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id])
}
`
    const registry = buildModelRegistry([
      {
        moduleId: 'crm',
        pythonPkg: 'crm',
        models: parsePrismaSchema(odd),
      },
    ])
    const py = emitSqlAlchemyModels(parsePrismaSchema(ords), registry)
    // Without registry the guess would have been "customers.id" — wrong.
    expect(py).toContain('ForeignKey("crm_customers.id")')
  })

  it('first-wins on duplicate model names across modules', () => {
    const a = `
model Item {
  id String @id @default(uuid())
  @@map("items_a")
}
`
    const b = `
model Item {
  id String @id @default(uuid())
  @@map("items_b")
}
`
    const registry = buildModelRegistry([
      { moduleId: 'a', pythonPkg: 'a', models: parsePrismaSchema(a) },
      { moduleId: 'b', pythonPkg: 'b', models: parsePrismaSchema(b) },
    ])
    expect(registry.get('Item')?.tableName).toBe('items_a')
    expect(registry.get('Item')?.sourceModuleId).toBe('a')
  })
})


describe('reverse-relationship pairing', () => {
  // Within-file 1:N — the common case the parser handles fully.
  const SCHEMA = `
model User {
  id     String  @id @default(uuid())
  email  String  @unique
  orders Order[]
  @@map("users")
}

model Order {
  id          String  @id @default(uuid())
  customerId  String
  customer    User    @relation(fields: [customerId], references: [id], onDelete: Cascade)
  total       Decimal @db.Decimal(10, 2)
  @@map("orders")
}
`

  it('parser pairs forward FK with reverse list field', () => {
    const models = parsePrismaSchema(SCHEMA)
    const order = models.find((m) => m.name === 'Order')!
    const cid = order.fields.find((f) => f.name === 'customerId')!
    expect(cid.fk?.forwardFieldName).toBe('customer')
    expect(cid.fk?.reverseFieldName).toBe('orders')

    // Both virtual accessors land on model.relations
    const user = models.find((m) => m.name === 'User')!
    expect(user.relations).toEqual([
      {
        name: 'orders',
        targetModel: 'Order',
        isList: true,
        inverseFieldName: 'customer',
      },
    ])
    expect(order.relations).toEqual([
      {
        name: 'customer',
        targetModel: 'User',
        isList: false,
        inverseFieldName: 'orders',
      },
    ])
  })

  it('reverse list field is dropped from columns (not a real DB column)', () => {
    const models = parsePrismaSchema(SCHEMA)
    const user = models.find((m) => m.name === 'User')!
    const fieldNames = user.fields.map((f) => f.name)
    expect(fieldNames).not.toContain('orders')
    expect(fieldNames).toEqual(['id', 'email'])
  })

  it('django emitter uses the reverse field name as related_name', () => {
    const py = emitDjangoModels(parsePrismaSchema(SCHEMA))
    expect(py).toContain('related_name="orders"')
    // Make sure we no longer always emit the suppress-back-ref `+`
    expect(py).not.toContain('related_name="+"')
  })

  it('django emitter falls back to "+" when no reverse pairing exists', () => {
    const oneSided = `
model Order {
  id          String  @id @default(uuid())
  customerId  String
  customer    User    @relation(fields: [customerId], references: [id])
}
`
    // No User model in scope → no reverse pairing → suppress back-ref
    const py = emitDjangoModels(parsePrismaSchema(oneSided))
    expect(py).toContain('related_name="+"')
  })

  it('sqlalchemy emitter emits relationship() on both sides with back_populates', () => {
    const py = emitSqlAlchemyModels(parsePrismaSchema(SCHEMA))
    expect(py).toContain('from sqlalchemy.orm import Mapped, mapped_column, relationship')
    expect(py).toContain('from typing import List')
    // User side — list relationship with back_populates pointing at the FK side
    expect(py).toContain(
      'orders: Mapped[List["Order"]] = relationship("Order", back_populates="customer")',
    )
    // Order side — single relationship pointing back at the list side
    expect(py).toContain(
      'customer: Mapped["User"] = relationship("User", back_populates="orders")',
    )
  })

  it('sqlalchemy emitter omits relationship import when no relations exist', () => {
    const flat = `
model X {
  id String @id @default(uuid())
  name String
}
`
    const py = emitSqlAlchemyModels(parsePrismaSchema(flat))
    expect(py).not.toContain('relationship')
    expect(py).not.toContain('from typing import List')
  })

  it('camelCase reverse field is snake-cased in both emitters', () => {
    const camel = `
model Account {
  id            String   @id @default(uuid())
  invoiceItems  Invoice[]
}

model Invoice {
  id          String  @id @default(uuid())
  accountId   String
  account     Account @relation(fields: [accountId], references: [id])
}
`
    const dj = emitDjangoModels(parsePrismaSchema(camel))
    expect(dj).toContain('related_name="invoice_items"')

    const sa = emitSqlAlchemyModels(parsePrismaSchema(camel))
    expect(sa).toContain(
      'invoice_items: Mapped[List["Invoice"]] = relationship("Invoice", back_populates="account")',
    )
    expect(sa).toContain(
      'account: Mapped["Account"] = relationship("Account", back_populates="invoice_items")',
    )
  })
})


describe('pairAcrossFiles', () => {
  // Forward declared in one file, reverse declared in another (the
  // common cross-module shape — e.g. orders.Order.customer → User where
  // User.orders lives in auth-core's schema).
  const USER_FILE = `
model User {
  id     String  @id @default(uuid())
  email  String  @unique
  orders Order[]
  @@map("users")
}
`
  const ORDERS_FILE = `
model Order {
  id          String  @id @default(uuid())
  customerId  String
  customer    User    @relation(fields: [customerId], references: [id], onDelete: Cascade)
  total       Decimal @db.Decimal(10, 2)
  @@map("orders")
}
`

  it('within-file parse leaves cross-file forward unpaired', () => {
    const orders = parsePrismaSchema(ORDERS_FILE)
    const order = orders[0]
    // Within-file pairing fails: no User in this file → forward stays
    // unpaired, reverseFieldName not set, no relations[] entry.
    expect(order.fields.find((f) => f.name === 'customerId')!.fk).toBeDefined()
    expect(
      order.fields.find((f) => f.name === 'customerId')!.fk!.reverseFieldName,
    ).toBeUndefined()
    expect(order.relations).toEqual([])
    expect(order._unpairedForwards).toHaveLength(1)
    expect(order._unpairedForwards![0].targetModel).toBe('User')
  })

  it('within-file parse leaves cross-file reverse unpaired', () => {
    const users = parsePrismaSchema(USER_FILE)
    const user = users[0]
    expect(user.relations).toEqual([])
    expect(user._unpairedReverses).toHaveLength(1)
    expect(user._unpairedReverses![0].fieldName).toBe('orders')
    expect(user._unpairedReverses![0].targetModel).toBe('Order')
  })

  it('pairs forwards in module A with reverses in module B', () => {
    const users = parsePrismaSchema(USER_FILE)
    const orders = parsePrismaSchema(ORDERS_FILE)
    pairAcrossFiles([...users, ...orders])

    const order = orders[0]
    const user = users[0]

    // Forward FK now knows its reverse name.
    expect(
      order.fields.find((f) => f.name === 'customerId')!.fk!.reverseFieldName,
    ).toBe('orders')

    // Both sides now have a RelationAccessor.
    expect(order.relations).toEqual([
      {
        name: 'customer',
        targetModel: 'User',
        isList: false,
        inverseFieldName: 'orders',
      },
    ])
    expect(user.relations).toEqual([
      {
        name: 'orders',
        targetModel: 'Order',
        isList: true,
        inverseFieldName: 'customer',
      },
    ])

    // Pools drained.
    expect(order._unpairedForwards).toEqual([])
    expect(user._unpairedReverses).toEqual([])
  })

  it('django emit picks up cross-file related_name after pairing', () => {
    const users = parsePrismaSchema(USER_FILE)
    const orders = parsePrismaSchema(ORDERS_FILE)
    pairAcrossFiles([...users, ...orders])

    const py = emitDjangoModels(orders)
    expect(py).toContain('related_name="orders"')
    expect(py).not.toContain('related_name="+"')
  })

  it('sqlalchemy emit produces both relationship() helpers after pairing', () => {
    const users = parsePrismaSchema(USER_FILE)
    const orders = parsePrismaSchema(ORDERS_FILE)
    pairAcrossFiles([...users, ...orders])

    const userPy = emitSqlAlchemyModels(users)
    const orderPy = emitSqlAlchemyModels(orders)
    expect(userPy).toContain(
      'orders: Mapped[List["Order"]] = relationship("Order", back_populates="customer")',
    )
    expect(orderPy).toContain(
      'customer: Mapped["User"] = relationship("User", back_populates="orders")',
    )
  })

  it('idempotent: pairAcrossFiles can run twice without double-emit', () => {
    const users = parsePrismaSchema(USER_FILE)
    const orders = parsePrismaSchema(ORDERS_FILE)
    pairAcrossFiles([...users, ...orders])
    pairAcrossFiles([...users, ...orders])
    expect(orders[0].relations).toHaveLength(1) // not 2
    expect(users[0].relations).toHaveLength(1)
  })

  it('skips orphan reverses without a matching cross-file forward', () => {
    const a = `model Author {
  id     String @id @default(uuid())
  posts  Post[]
}`
    // Note: no Author.id back-reference on Post — operator forgot the FK
    const b = `model Post {
  id    String @id @default(uuid())
  title String
}`
    const aModels = parsePrismaSchema(a)
    const bModels = parsePrismaSchema(b)
    pairAcrossFiles([...aModels, ...bModels])
    // Author.posts stays unpaired → no relations
    expect(aModels[0].relations).toEqual([])
    expect(aModels[0]._unpairedReverses).toHaveLength(1)
  })
})
