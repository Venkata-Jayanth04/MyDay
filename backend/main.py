from fastapi.middleware.cors import CORSMiddleware
from datetime import date

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas

from database import engine, get_db


models.Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="MyDay API",
    description="Personal timetable and productivity application",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://192.168.31.71:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "MyDay API is running!"
    }


@app.post("/activities", response_model=schemas.ActivityResponse)
def create_activity(
    activity: schemas.ActivityCreate,
    db: Session = Depends(get_db)
):

    new_activity = models.Activity(
        title=activity.title,
        description=activity.description,
        activity_date=activity.activity_date,
        start_time=activity.start_time,
        end_time=activity.end_time,
        category=activity.category,
        reminder=activity.reminder,
        completed=False
    )

    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)

    return new_activity


@app.get("/activities", response_model=list[schemas.ActivityResponse])
def get_activities(
    activity_date: date | None = None,
    db: Session = Depends(get_db)
):

    query = db.query(models.Activity)

    if activity_date:
        query = query.filter(
            models.Activity.activity_date == activity_date
        )

    return query.order_by(
        models.Activity.start_time
    ).all()


@app.get(
    "/activities/{activity_id}",
    response_model=schemas.ActivityResponse
)
def get_activity(
    activity_id: int,
    db: Session = Depends(get_db)
):

    activity = db.query(models.Activity).filter(
        models.Activity.id == activity_id
    ).first()

    if not activity:
        raise HTTPException(
            status_code=404,
            detail="Activity not found"
        )

    return activity

@app.put(
    "/activities/{activity_id}",
    response_model=schemas.ActivityResponse
)
def update_activity(
    activity_id: int,
    activity: schemas.ActivityUpdate,
    db: Session = Depends(get_db)
):

    existing_activity = db.query(models.Activity).filter(
        models.Activity.id == activity_id
    ).first()

    if not existing_activity:
        raise HTTPException(
            status_code=404,
            detail="Activity not found"
        )

    existing_activity.title = activity.title
    existing_activity.description = activity.description
    existing_activity.activity_date = activity.activity_date
    existing_activity.start_time = activity.start_time
    existing_activity.end_time = activity.end_time
    existing_activity.category = activity.category
    existing_activity.reminder = activity.reminder

    db.commit()
    db.refresh(existing_activity)

    return existing_activity

@app.put(
    "/activities/{activity_id}/complete",
    response_model=schemas.ActivityResponse
)
def complete_activity(
    activity_id: int,
    db: Session = Depends(get_db)
):

    activity = db.query(models.Activity).filter(
        models.Activity.id == activity_id
    ).first()

    if not activity:
        raise HTTPException(
            status_code=404,
            detail="Activity not found"
        )

    activity.completed = not activity.completed

    db.commit()
    db.refresh(activity)

    return activity


@app.delete("/activities/{activity_id}")
def delete_activity(
    activity_id: int,
    db: Session = Depends(get_db)
):

    activity = db.query(models.Activity).filter(
        models.Activity.id == activity_id
    ).first()

    if not activity:
        raise HTTPException(
            status_code=404,
            detail="Activity not found"
        )

    db.delete(activity)
    db.commit()

    return {
        "message": "Activity deleted successfully"
    }