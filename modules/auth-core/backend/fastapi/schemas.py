"""Shared auth schemas — User + Session + AuthResponse.

Strategy-specific request schemas (LoginRequest, SignupRequest, OAuthCallback)
live in their respective variant modules (auth-jwt, auth-oauth).
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


class ChangePasswordRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    current_password: str | None = Field(default=None, alias="currentPassword")
    new_password: str = Field(min_length=8, max_length=128, alias="newPassword")
