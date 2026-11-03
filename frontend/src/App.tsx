
import { useEffect, useMemo, useState } from "react";
import "./App.css";

type IssueStatus = "Open" | "In Progress" | "Resolved";

interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  createdAt: string;
}

const API_URL = "http://localhost:5000/api/issues";

function App() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadIssues = async () => {
    try {
      setError("");
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not fetch issues");
      }

      const data: Issue[] = await response.json();
      setIssues(data);
    } catch {
      setError("Unable to connect to the backend. Make sure your server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const stats = useMemo(() => ({
    total: issues.length,
    open: issues.filter((issue) => issue.status === "Open").length,
    progress: issues.filter((issue) => issue.status === "In Progress").length,
    resolved: issues.filter((issue) => issue.status === "Resolved").length,
  }), [issues]);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch =
        issue.title.toLowerCase().includes(search.toLowerCase()) ||
        issue.description.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || issue.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [issues, search, filter]);

  const createIssue = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !description.trim()) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create issue");
      }

      const newIssue: Issue = await response.json();
      setIssues((previous) => [newIssue, ...previous]);
      setTitle("");
      setDescription("");
      setShowForm(false);
    } catch {
      setError("Could not create the issue. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: IssueStatus) => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update issue");
      }

      const updatedIssue: Issue = await response.json();

      setIssues((previous) =>
        previous.map((issue) =>
          issue.id === id ? updatedIssue : issue
        )
      );
    } catch {
      setError("Could not update the issue status.");
    }
  };

  const deleteIssue = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete issue");
      }

      setIssues((previous) =>
        previous.filter((issue) => issue.id !== id)
      );
    } catch {
      setError("Could not delete the issue.");
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">C</div>
          <span>CloudTrack</span>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <div className="nav-item active">
          <span>▦</span> Overview
        </div>

        <div className="nav-item">
          <span>☷</span> Issues
          <span className="nav-count">{issues.length}</span>
        </div>

        <div className="sidebar-bottom">
          <div className="profile-avatar">A</div>
          <div>
            <strong>Admin</strong>
            <small>Workspace owner</small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="breadcrumb">Workspace / Overview</div>
            <h1>Issue Dashboard</h1>
            <p>Manage and track your reported issues.</p>
          </div>

          <button className="primary-button" onClick={() => setShowForm(!showForm)}>
            <span>＋</span> Create issue
          </button>
        </header>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span>Total issues</span>
              <span className="stat-icon purple">▦</span>
            </div>
            <strong>{stats.total}</strong>
            <small>All reported issues</small>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Open</span>
              <span className="stat-icon orange">○</span>
            </div>
            <strong>{stats.open}</strong>
            <small>Awaiting attention</small>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>In progress</span>
              <span className="stat-icon blue">◷</span>
            </div>
            <strong>{stats.progress}</strong>
            <small>Currently being worked on</small>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Resolved</span>
              <span className="stat-icon green">✓</span>
            </div>
            <strong>{stats.resolved}</strong>
            <small>Successfully completed</small>
          </div>
        </section>

        {showForm && (
          <section className="form-card">
            <div className="section-heading">
              <div>
                <h2>Create a new issue</h2>
                <p>Provide details about the problem.</p>
              </div>
              <button className="close-button" onClick={() => setShowForm(false)}>
                ×
              </button>
            </div>

            <form onSubmit={createIssue}>
              <label htmlFor="issue-title">Issue title</label>
              <input
                id="issue-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Login page not working"
                required
              />

              <label htmlFor="issue-description">Description</label>
              <textarea
                id="issue-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the issue..."
                rows={3}
                required
              />

              <button className="primary-button" type="submit" disabled={saving}>
                {saving ? "Creating..." : "Submit issue"}
              </button>
            </form>
          </section>
        )}

        <section className="issues-section">
          <div className="section-heading">
            <div>
              <h2>All issues</h2>
              <p>View and manage your reported issues.</p>
            </div>
            <button className="refresh-button" onClick={loadIssues}>
              ↻ Refresh
            </button>
          </div>

          <div className="toolbar">
            <input
              className="search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search issues..."
            />

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option>All</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
          </div>

          {loading ? (
            <div className="empty-state">Loading issues...</div>
          ) : filteredIssues.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">☷</div>
              <h3>No issues found</h3>
              <p>Create a new issue or change your search filter.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ISSUE</th>
                    <th>CREATED</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredIssues.map((issue) => (
                    <tr key={issue.id}>
                      <td>
                        <div className="issue-title">{issue.title}</div>
                        <div className="issue-description">
                          {issue.description}
                        </div>
                      </td>

                      <td className="date-cell">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </td>

                      <td>
                        <select
                          className={`status-select ${issue.status.toLowerCase().replace(" ", "-")}`}
                          value={issue.status}
                          onChange={(event) =>
                            updateStatus(issue.id, event.target.value as IssueStatus)
                          }
                        >
                          <option>Open</option>
                          <option>In Progress</option>
                          <option>Resolved</option>
                        </select>
                      </td>

                      <td>
                        <button
                          className="delete-button"
                          onClick={() => deleteIssue(issue.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="footer">
          CloudTrack · Issue management made simple
        </footer>
      </main>
    </div>
  );
}

export default App;
