from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal
from ..models.matter import MatterType, MatterStatus

class MatterBase(BaseModel):
    title: str
    description: Optional[str] = None
    matter_type: MatterType
    status: MatterStatus = MatterStatus.ACTIVE
    client_id: int
    assigned_attorney_id: Optional[int] = None
    hourly_rate: Optional[Decimal] = None
    estimated_hours: Optional[Decimal] = None
    budget: Optional[Decimal] = None
    due_date: Optional[datetime] = None

class MatterCreate(MatterBase):
    pass

class MatterUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    matter_type: Optional[MatterType] = None
    status: Optional[MatterStatus] = None
    assigned_attorney_id: Optional[int] = None
    hourly_rate: Optional[Decimal] = None
    estimated_hours: Optional[Decimal] = None
    budget: Optional[Decimal] = None
    due_date: Optional[datetime] = None

class MatterInDB(MatterBase):
    id: int
    matter_number: str
    created_by_id: int
    opened_date: datetime
    closed_date: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class Matter(MatterInDB):
    pass

class MatterList(BaseModel):
    matters: list[Matter]
    total: int
    page: int
    per_page: int