"""Pydantic schemas for auth@v1 endpoints.

Wirer placement: <output>/backend/app/auth/schemas.py

Field aliases produce camelCase output (matches OpenAPI conventions and the
TypeScript types in @b-dash/schemas).
"""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    email: EmailStr
    phone: str | None = None
    name: str | None = None
    role: str = "customer"
    email_verified: bool = Field(alias="emailVerified")
    mfa_enabled: bool = Field(alias="mfaEnabled")
    created_at: datetime = Field(alias="createdAt")


class SessionResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    token: str
    user_id: str = Field(alias="userId")
    expires_at: datetime = Field(alias="expiresAt")


class AuthResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user: UserResponse
    session: SessionResponse


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    token: str
    new_password: str = Field(min_length=8, max_length=128, alias="newPassword")
