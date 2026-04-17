import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const API = "http://localhost:5000";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    const res = await fetch(API + "/tasks");
    const data = await res.json();
    setTasks(data);
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const signup = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password required");
      return;
    }

    const res = await fetch(API + "/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setError("Signup failed");
      return;
    }

    setError("");
    alert("Signup successful. Now login.");
  };

  const login = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Enter email and password");
      return;
    }

    const res = await fetch(API + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setError("Invalid login");
      return;
    }

    const data = await res.json();
    setToken(data.token);
    localStorage.setItem("token", data.token);
    setError("");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setEmail("");
    setPassword("");
    setError("");
  };

  const addTask = async () => {
    if (!title.trim()) return;

    await fetch(API + "/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        dueDate,
        description,
      }),
    });

    setTitle("");
    setDueDate("");
    setDescription("");
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await fetch(API + "/tasks/" + id, {
      method: "DELETE",
    });

    fetchTasks();
  };

  const editTask = async (task) => {
    const newTitle = prompt("Edit task", task.title);

    if (!newTitle || !newTitle.trim()) return;

    await fetch(API + "/tasks/" + task._id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newTitle,
      }),
    });

    fetchTasks();
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;

    await fetch(API + "/tasks/" + draggableId, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: destination.droppableId }),
    });

    fetchTasks();
  };

  const columns = {
    todo: tasks.filter((t) => t.status === "todo"),
    doing: tasks.filter((t) => t.status === "doing"),
    done: tasks.filter((t) => t.status === "done"),
  };

  const columnColors = {
    todo: "#f4f5f7",
    doing: "#dbeafe",
    done: "#dcfce7",
  };

  const isOverdue = (date) => {
    if (!date) return false;
    const today = new Date();
    const due = new Date(date);

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    return due < today;
  };

  if (!token) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "340px",
            background: "#1e293b",
            padding: "28px",
            borderRadius: "14px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          <h2
            style={{
              color: "white",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            Login / Signup
          </h2>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              outline: "none",
              marginBottom: "12px",
            }}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              outline: "none",
              marginBottom: "12px",
            }}
          />

          {error && (
            <p style={{ color: "#f87171", marginBottom: "12px" }}>{error}</p>
          )}

          <button
            onClick={login}
            style={{
              width: "100%",
              padding: "12px",
              background: "#22c55e",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Login
          </button>

          <button
            onClick={signup}
            style={{
              width: "100%",
              padding: "12px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Signup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1 style={{ color: "white", margin: 0 }}>Trello Clone</h1>

        <button
          onClick={logout}
          style={{
            padding: "10px 16px",
            background: "#f59e0b",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Logout
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "30px",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter new task"
          style={{
            padding: "12px",
            width: "260px",
            borderRadius: "8px",
            border: "none",
            outline: "none",
          }}
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            outline: "none",
          }}
        />

        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          style={{
            padding: "12px",
            width: "220px",
            borderRadius: "8px",
            border: "none",
            outline: "none",
          }}
        />

        <button
          onClick={addTask}
          style={{
            padding: "12px 20px",
            background: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Add Task
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
          {["todo", "doing", "done"].map((col) => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    background: columnColors[col],
                    padding: "15px",
                    width: "300px",
                    minHeight: "400px",
                    borderRadius: "12px",
                  }}
                >
                  <h3
                    style={{
                      textAlign: "center",
                      marginBottom: "15px",
                      textTransform: "uppercase",
                    }}
                  >
                    {col}
                  </h3>

                  {columns[col].map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            background: "white",
                            padding: "12px",
                            marginBottom: "12px",
                            borderRadius: "10px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                            ...provided.draggableProps.style,
                          }}
                        >
                          <div
                            style={{
                              fontWeight: "600",
                              marginBottom: "8px",
                            }}
                          >
                            {task.title}
                          </div>

                          {task.dueDate && (
                            <div
                              style={{
                                marginBottom: "10px",
                                fontSize: "13px",
                                fontWeight: "bold",
                                color: isOverdue(task.dueDate) ? "red" : "#2563eb",
                              }}
                            >
                              Due: {task.dueDate}
                            </div>
                          )}

                          {task.description && (
                            <div
                              style={{
                                marginBottom: "10px",
                                fontSize: "13px",
                                color: "#374151",
                              }}
                            >
                              {task.description}
                            </div>
                          )}

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              justifyContent: "flex-end",
                            }}
                          >
                            <button
                              onClick={() => editTask(task)}
                              style={{
                                background: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                padding: "6px 10px",
                                cursor: "pointer",
                                fontSize: "12px",
                              }}
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => deleteTask(task._id)}
                              style={{
                                background: "#ef4444",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                padding: "6px 10px",
                                cursor: "pointer",
                                fontSize: "12px",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default App;