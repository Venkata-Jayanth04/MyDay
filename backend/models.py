from sqlalchemy import Column, Integer, String, Boolean, Date, Time, Text
from database import Base


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(200), nullable=False)

    description = Column(Text, nullable=True)

    activity_date = Column(Date, nullable=False)

    start_time = Column(Time, nullable=False)

    end_time = Column(Time, nullable=False)

    category = Column(String(100), nullable=True)

    completed = Column(Boolean, default=False)

    reminder = Column(Boolean, default=False)