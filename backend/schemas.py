from datetime import date, time
from typing import Optional

from pydantic import BaseModel


class ActivityCreate(BaseModel):
    title: str
    description: Optional[str] = None
    activity_date: date
    start_time: time
    end_time: time
    category: Optional[str] = None
    reminder: bool = False


class ActivityUpdate(BaseModel):
    title: str
    description: Optional[str] = None
    activity_date: date
    start_time: time
    end_time: time
    category: Optional[str] = None
    reminder: bool = False


class ActivityResponse(ActivityCreate):
    id: int
    completed: bool

    class Config:
        from_attributes = True