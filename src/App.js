import React, { Component } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";

// App Component
class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <h1>User Management</h1>
          <Routes>
            <Route path="/" element={<UserList />} />
          </Routes>
        </div>
      </Router>
    );
  }
}

// UserList Component
// UserList Component
class UserList extends Component {
  state = {
    users: [],
    error: "",
    userToEdit: null, // Track the user being edited
  };

  // Fetch users on mount
  componentDidMount() {
    this.fetchUsers();
  }

  fetchUsers = async () => {
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users.");
      }
      const data = await response.json();
      this.setState({ users: data });
    } catch (error) {
      this.setState({ error: "Something went wrong while fetching users." });
    }
  };

  // Add user
  addUser = (user) => {
    this.setState((prevState) => ({
      users: [...prevState.users, user],
    }));
  };

  // Delete user
  deleteUser = async (id) => {
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user.");
      }

      this.setState((prevState) => ({
        users: prevState.users.filter((user) => user.id !== id),
      }));
    } catch (error) {
      this.setState({ error: "Something went wrong while deleting the user." });
    }
  };

  // Edit user
  editUser = (user) => {
    this.setState({ userToEdit: user });
  };

  // Update user
  updateUser = async (user) => {
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error("Failed to update user.");
      }

      const updatedUser = await response.json();
      this.setState((prevState) => ({
        users: prevState.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
        userToEdit: null, // Reset editing state
      }));
    } catch (error) {
      this.setState({ error: "Something went wrong while updating the user." });
    }
  };

  render() {
    const { users, error, userToEdit } = this.state;

    return (
      <div className="user-list">
        {error && <p className="error">{error}</p>}
        <UserForm
          onSubmit={this.addUser}  // Add user handler
          onEdit={this.updateUser}  // Edit user handler
          userToEdit={userToEdit}   // User to be edited
        />
        <ul className="user-items">
          {users.map((user) => (
            <li key={user.id} className="user-item">
              {user.name} ({user.email})
              <button onClick={() => this.editUser(user)} className="edit-button">Edit</button>
              <button onClick={() => this.deleteUser(user.id)} className="delete-button">Delete</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

// UserForm Component
class UserForm extends Component {
  state = {
    id: "",
    name: "",
    email: "",
    isEditing: false,
  };

  // Update form when a user is selected for editing
  componentDidUpdate(prevProps) {
    if (this.props.userToEdit && this.props.userToEdit !== prevProps.userToEdit) {
      const { id, name, email } = this.props.userToEdit;
      this.setState({ id, name, email, isEditing: true });
    }
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { id, name, email, isEditing } = this.state;

    const user = { id, name, email };

    if (isEditing) {
      if (this.props.onEdit) {
        this.props.onEdit(user);  // Call onEdit function to update user
      }
    } else {
      if (this.props.onSubmit) {
        this.props.onSubmit(user);  // Call onSubmit function to add user
      }
    }

    // Reset form after submission
    this.setState({ id: "", name: "", email: "", isEditing: false });
  };

  render() {
    const { id, name, email, isEditing } = this.state;

    return (
      <form onSubmit={this.handleSubmit} className="user-form">
        <input
          type="text"
          name="id"
          value={id}
          onChange={this.handleChange}
          placeholder="ID"
          required
          className="form-input"
          disabled={isEditing} // Disable ID input during editing
        />
        <input
          type="text"
          name="name"
          value={name}
          onChange={this.handleChange}
          placeholder="Name"
          required
          className="form-input"
        />
        <input
          type="email"
          name="email"
          value={email}
          onChange={this.handleChange}
          placeholder="Email"
          required
          className="form-input"
        />
        <button type="submit" className="form-button">
          {isEditing ? "Update" : "Add"} User
        </button>
      </form>
    );
  }
}

// ErrorBoundary Component
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong.</h2>;
    }

    return this.props.children;
  }
}

export default App;
