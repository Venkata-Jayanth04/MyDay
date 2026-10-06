import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://myday-backend-061d.onrender.com";

// Get today's date in local time
const getToday = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function App() {
  const [activities, setActivities] = useState([]);
  const [weekActivities, setWeekActivities] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [deleteActivity, setDeleteActivity] = useState(null);
  const [editActivity, setEditActivity] = useState(null);

  // Currently selected date
  const [selectedDate, setSelectedDate] = useState(getToday());

  // Custom time picker state
  const [timePicker, setTimePicker] = useState({
    open: false,
    field: null,
    hour: "09",
    minute: "00",
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    activity_date: "",
    start_time: "",
    end_time: "",
    category: "Study",
    reminder: true,
  });

  // Convert YYYY-MM-DD into a Date object
  const dateFromString = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day);
  };

  // Convert Date object into YYYY-MM-DD
  const dateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Get all 7 dates of the week (Monday to Sunday)
  const getWeekDates = (dateString) => {
    const date = dateFromString(dateString);

    const day = date.getDay();

    // Convert Sunday from 0 to 7
    const adjustedDay = day === 0 ? 7 : day;

    // Find Monday
    const monday = new Date(date);
    monday.setDate(date.getDate() - adjustedDay + 1);

    const weekDates = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);

      weekDates.push(dateToString(currentDate));
    }

    return weekDates;
  };

  // Format selected date for display
  const formatSelectedDate = (dateString) => {
    const date = dateFromString(dateString);

    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Fetch activities for selected date
  const fetchActivities = async (date = selectedDate) => {
    try {
      const response = await fetch(
        `${API_URL}/activities?activity_date=${date}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      console.log("Activities received:", data);

      setActivities(data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  // Fetch activities for the entire visible week
  const fetchWeekActivities = async (dateString) => {
    try {
      const weekDates = getWeekDates(dateString);

      const responses = await Promise.all(
        weekDates.map((date) =>
          fetch(`${API_URL}/activities?activity_date=${date}`)
        )
      );

      const data = await Promise.all(
        responses.map(async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }

          return response.json();
        })
      );

      const allActivities = data.flat();

      console.log("Weekly activities received:", allActivities);

      setWeekActivities(allActivities);
    } catch (error) {
      console.error("Error fetching weekly activities:", error);
    }
  };

  // Load selected day and entire week whenever selected date changes
  useEffect(() => {
    fetchActivities(selectedDate);
    fetchWeekActivities(selectedDate);
  }, [selectedDate]);

  // Go to previous day
  const handlePreviousDay = () => {
    const currentDate = dateFromString(selectedDate);

    currentDate.setDate(currentDate.getDate() - 1);

    setSelectedDate(dateToString(currentDate));
  };

  // Go to next day
  const handleNextDay = () => {
    const currentDate = dateFromString(selectedDate);

    currentDate.setDate(currentDate.getDate() + 1);

    setSelectedDate(dateToString(currentDate));
  };

  // Move one week backward
  const handlePreviousWeek = () => {
    const date = dateFromString(selectedDate);

    date.setDate(date.getDate() - 7);

    setSelectedDate(dateToString(date));
  };

  // Move one week forward
  const handleNextWeek = () => {
    const date = dateFromString(selectedDate);

    date.setDate(date.getDate() + 7);

    setSelectedDate(dateToString(date));
  };

  // Go back to today
  const handleToday = () => {
    setSelectedDate(getToday());
  };

  // Check whether selected date is today
  const isToday = selectedDate === getToday();

  // Handle form input changes
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ==========================================
  // TIME PICKER
  // ==========================================

  // Open custom time picker
  const openTimePicker = (field) => {
    const currentValue = formData[field];

    let hour = "09";
    let minute = "00";

    if (currentValue) {
      const [currentHour, currentMinute] = currentValue.split(":");

      hour = currentHour || "09";
      minute = currentMinute || "00";
    }

    setTimePicker({
      open: true,
      field: field,
      hour: hour,
      minute: minute,
    });
  };

  // Save selected time
  const saveTime = () => {
    const selectedTime = `${timePicker.hour}:${timePicker.minute}`;

    setFormData({
      ...formData,
      [timePicker.field]: selectedTime,
    });

    setTimePicker({
      open: false,
      field: null,
      hour: "09",
      minute: "00",
    });
  };

  // Close time picker
  const closeTimePicker = () => {
    setTimePicker({
      open: false,
      field: null,
      hour: "09",
      minute: "00",
    });
  };

  // Open form for adding a new activity
  const handleAddActivity = () => {
    setEditActivity(null);

    setFormData({
      title: "",
      description: "",
      activity_date: selectedDate,
      start_time: "",
      end_time: "",
      category: "Study",
      reminder: true,
    });

    setShowForm(true);
  };

  // Open form for editing an existing activity
  const handleEdit = (activity) => {
    setEditActivity(activity);

    setFormData({
      title: activity.title,
      description: activity.description || "",
      activity_date: activity.activity_date,
      start_time: activity.start_time.slice(0, 5),
      end_time: activity.end_time.slice(0, 5),
      category: activity.category || "Study",
      reminder: activity.reminder,
    });

    setShowForm(true);
  };

  // Add or update activity
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const url = editActivity
        ? `${API_URL}/activities/${editActivity.id}`
        : `${API_URL}/activities`;

      const method = editActivity ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        console.error("Backend error:", errorData);

        alert(
          editActivity
            ? "Failed to update activity. Please check the form."
            : "Failed to add activity. Please check the form."
        );

        return;
      }

      const savedActivity = await response.json();

      console.log(
        editActivity
          ? "Activity updated:"
          : "Activity created:",
        savedActivity
      );

      // Refresh selected date
      await fetchActivities(selectedDate);

      // Refresh entire visible week
      await fetchWeekActivities(selectedDate);

      // Reset form
      setFormData({
        title: "",
        description: "",
        activity_date: selectedDate,
        start_time: "",
        end_time: "",
        category: "Study",
        reminder: true,
      });

      setEditActivity(null);
      setShowForm(false);

      alert(
        editActivity
          ? "Activity updated successfully!"
          : "Activity added successfully!"
      );
    } catch (error) {
      console.error(
        editActivity
          ? "Error updating activity:"
          : "Error adding activity:",
        error
      );

      alert("Could not connect to the backend.");
    }
  };

  // Close form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditActivity(null);

    closeTimePicker();

    setFormData({
      title: "",
      description: "",
      activity_date: selectedDate,
      start_time: "",
      end_time: "",
      category: "Study",
      reminder: true,
    });
  };

  // Toggle activity completion
  const handleComplete = async (activityId) => {
    try {
      const response = await fetch(
        `${API_URL}/activities/${activityId}/complete`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const updatedActivity = await response.json();

      console.log(
        "Activity completion updated:",
        updatedActivity
      );

      // Refresh selected day
      await fetchActivities(selectedDate);

      // Refresh weekly indicators
      await fetchWeekActivities(selectedDate);
    } catch (error) {
      console.error("Error updating activity:", error);
      alert("Could not update activity.");
    }
  };

  // Delete activity
  const handleDelete = async (activityId) => {
    try {
      const response = await fetch(
        `${API_URL}/activities/${activityId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result = await response.json();

      console.log("Activity deleted:", result);

      // Refresh selected day
      await fetchActivities(selectedDate);

      // Refresh weekly indicators
      await fetchWeekActivities(selectedDate);
    } catch (error) {
      console.error("Error deleting activity:", error);
      alert("Could not delete activity.");
    }
  };

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div>
          <h1>MyDay</h1>
          <p>Your personal daily planner</p>
        </div>

        <div className="date">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </header>

      <main className="main">

        {/* Date Navigation */}
        <section className="date-navigation">

          <button
            className="date-nav-button"
            onClick={handlePreviousDay}
            aria-label="Previous day"
          >
            ←
          </button>

          <div className="selected-date">
            <h2>
              {formatSelectedDate(selectedDate)}
            </h2>

            {!isToday && (
              <button
                className="today-button"
                onClick={handleToday}
              >
                Today
              </button>
            )}
          </div>

          <button
            className="date-nav-button"
            onClick={handleNextDay}
            aria-label="Next day"
          >
            →
          </button>

        </section>

        {/* Week Navigation */}
        <div className="week-navigation">

          <button
            className="week-navigation-button"
            onClick={handlePreviousWeek}
          >
            ← Previous Week
          </button>

          <button
            className="week-navigation-button"
            onClick={handleNextWeek}
          >
            Next Week →
          </button>

        </div>

        {/* Weekly Calendar */}
        <section className="week-calendar">

          {getWeekDates(selectedDate)
            .filter(
              (date) =>
                date && !date.includes("NaN")
            )
            .map((date) => {

              const dateObject = dateFromString(date);

              const dayName =
                dateObject.toLocaleDateString(
                  "en-IN",
                  {
                    weekday: "short",
                  }
                );

              const dayNumber =
                dateObject.getDate();

              const isSelected =
                date === selectedDate;

              const isTodayDate =
                date === getToday();

              // Activities for this specific day
              const dayActivities =
                weekActivities.filter(
                  (activity) =>
                    activity.activity_date === date
                );

              const activityCount =
                dayActivities.length;

              return (
                <button
                  key={date}
                  className={`week-day ${
                    isSelected ? "selected" : ""
                  } ${
                    isTodayDate ? "today" : ""
                  }`}
                  onClick={() =>
                    setSelectedDate(date)
                  }
                >

                  <span className="week-day-name">
                    {dayName}
                  </span>

                  <span className="week-day-number">
                    {dayNumber}
                  </span>

                  {activityCount > 0 && (
                    <span className="activity-indicator">
                      {activityCount >= 3
                        ? "●●●"
                        : "●".repeat(
                            activityCount
                          )}
                    </span>
                  )}

                </button>
              );
            })}

        </section>

        {/* Activities Heading */}
        <section className="welcome">

          <div>

            <h2>
              {isToday
                ? "Today's Activities"
                : "Activities"}
            </h2>

            <p>
              Stay organized and make the most of your day.
            </p>

          </div>

          <button
            className="add-button"
            onClick={handleAddActivity}
          >
            + Add Activity
          </button>

        </section>

        {/* Add / Edit Activity Form */}
        {showForm && (
          <section className="form-card">

            <div className="form-header">

              <h2>
                {editActivity
                  ? "Edit Activity"
                  : "Add New Activity"}
              </h2>

              <button
                className="close-button"
                onClick={handleCloseForm}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              {/* Title */}
              <div className="form-group">

                <label>Title</label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Study Python"
                  required
                />

              </div>

              {/* Description */}
              <div className="form-group">

                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What do you want to do?"
                  rows="3"
                />

              </div>

              {/* Date */}
              <div className="form-group">

                <label>Date</label>

                <input
                  type="date"
                  name="activity_date"
                  value={
                    formData.activity_date ||
                    selectedDate
                  }
                  onChange={handleChange}
                  required
                />

              </div>

              {/* Time */}
              <div className="form-row">

                {/* Start Time */}
                <div className="form-group">

                  <label>Start Time</label>

                  <input
                    type="text"
                    name="start_time"
                    value={formData.start_time}
                    onClick={() =>
                      openTimePicker("start_time")
                    }
                    readOnly
                    placeholder="Select start time"
                    required
                  />

                </div>

                {/* End Time */}
                <div className="form-group">

                  <label>End Time</label>

                  <input
                    type="text"
                    name="end_time"
                    value={formData.end_time}
                    onClick={() =>
                      openTimePicker("end_time")
                    }
                    readOnly
                    placeholder="Select end time"
                    required
                  />

                </div>

              </div>

              {/* Category */}
              <div className="form-group">

                <label>Category</label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Study">
                    Study
                  </option>

                  <option value="Work">
                    Work
                  </option>

                  <option value="Health">
                    Health
                  </option>

                  <option value="Personal">
                    Personal
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

              {/* Reminder */}
              <div className="reminder">

                <input
                  type="checkbox"
                  name="reminder"
                  checked={formData.reminder}
                  onChange={handleChange}
                  id="reminder"
                />

                <label htmlFor="reminder">
                  Set reminder
                </label>

              </div>

              {/* Buttons */}
              <div className="form-buttons">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCloseForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  {editActivity
                    ? "Save Changes"
                    : "Add Activity"}
                </button>

              </div>

            </form>

          </section>
        )}

        {/* Activities */}
        <section className="activities">

          {activities.length === 0 ? (

            <div className="empty">

              <h3>
                No activities yet
              </h3>

              <p>
                Add your first activity to start
                planning your day.
              </p>

            </div>

          ) : (

            activities.map((activity) => (

              <div
                className="activity-card"
                key={activity.id}
              >

                {/* Delete button */}
                <button
                  className="delete-button"
                  onClick={() =>
                    setDeleteActivity(activity)
                  }
                  aria-label={`Delete ${activity.title}`}
                >
                  ×
                </button>

                {/* Time */}
                <div className="activity-time">

                  <strong>
                    {activity.start_time.slice(0, 5)}
                  </strong>

                  <span>
                    {activity.end_time.slice(0, 5)}
                  </span>

                </div>

                {/* Activity Information */}
                <div className="activity-info">

                  {/* Title + Edit */}
                  <h3 className="activity-title">

                    {activity.title}

                    <button
                      className="edit-button"
                      onClick={() =>
                        handleEdit(activity)
                      }
                      aria-label={`Edit ${activity.title}`}
                      title="Edit activity"
                    >
                      🖉
                    </button>

                  </h3>

                  {/* Description */}
                  <p>
                    {activity.description}
                  </p>

                  {/* Meta */}
                  <div className="activity-meta">

                    <span className="category">
                      {activity.category}
                    </span>

                    {/* Completion */}
                    <button
                      className={
                        activity.completed
                          ? "completed-button"
                          : "complete-button"
                      }
                      onClick={() =>
                        handleComplete(activity.id)
                      }
                    >
                      {activity.completed
                        ? "✓ Completed"
                        : "Mark Complete"}
                    </button>

                    {/* Reminder */}
                    {activity.reminder && (
                      <span className="reminder-badge">
                        🔔 Reminder
                      </span>
                    )}

                  </div>

                </div>

              </div>

            ))

          )}

        </section>

        {/* Delete Confirmation Modal */}
        {deleteActivity && (

          <div className="modal-overlay">

            <div className="delete-modal">

              <h2>
                Delete "{deleteActivity.title}"?
              </h2>

              <p>
                This activity will be permanently removed.
              </p>

              <div className="delete-modal-buttons">

                <button
                  className="cancel-delete-button"
                  onClick={() =>
                    setDeleteActivity(null)
                  }
                >
                  Cancel
                </button>

                <button
                  className="confirm-delete-button"
                  onClick={async () => {
                    await handleDelete(
                      deleteActivity.id
                    );

                    setDeleteActivity(null);
                  }}
                >
                  Delete
                </button>

              </div>

            </div>

          </div>

        )}

        {/* Time Picker Modal */}
        {timePicker.open && (

          <div className="modal-overlay">

            <div className="time-picker-modal">

              {/* Header */}
              <div className="time-picker-header">

                <h2>
                  {timePicker.field === "start_time"
                    ? "Select Start Time"
                    : "Select End Time"}
                </h2>

                <button
                  type="button"
                  className="close-button"
                  onClick={closeTimePicker}
                  aria-label="Close time picker"
                >
                  ×
                </button>

              </div>

              {/* Selected Time */}
              <div className="selected-time-display">
                {timePicker.hour}:{timePicker.minute}
              </div>

              {/* Hour and Minute */}
              <div className="time-picker-selectors">

                {/* Hour */}
                <div className="time-selector">

                  <label>Hour</label>

                  <select
                    value={timePicker.hour}
                    onChange={(event) =>
                      setTimePicker({
                        ...timePicker,
                        hour: event.target.value,
                      })
                    }
                  >

                    {Array.from(
                      { length: 24 },
                      (_, index) => {

                        const hour =
                          String(index).padStart(
                            2,
                            "0"
                          );

                        return (
                          <option
                            key={hour}
                            value={hour}
                          >
                            {hour}
                          </option>
                        );

                      }
                    )}

                  </select>

                </div>

                {/* Colon */}
                <div className="time-colon">
                  :
                </div>

                {/* Minute */}
                <div className="time-selector">

                  <label>Minute</label>

                  <select
                    value={timePicker.minute}
                    onChange={(event) =>
                      setTimePicker({
                        ...timePicker,
                        minute: event.target.value,
                      })
                    }
                  >

                    {Array.from(
                      { length: 60 },
                      (_, index) => {

                        const minute =
                          String(index).padStart(
                            2,
                            "0"
                          );

                        return (
                          <option
                            key={minute}
                            value={minute}
                          >
                            {minute}
                          </option>
                        );

                      }
                    )}

                  </select>

                </div>

              </div>

              {/* Buttons */}
              <div className="time-picker-buttons">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeTimePicker}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="save-button"
                  onClick={saveTime}
                >
                  Set Time
                </button>

              </div>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}

export default App;