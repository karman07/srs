import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import axios from "axios";

interface User {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  dob: string;
  branch: string;
  semester: string;
}

const UserForm: React.FC<{ onRegister: () => void }> = ({ onRegister }) => {
  const [user, setUser] = useState<User>({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    dob: "",
    branch: "",
    semester: "",
  });

  const [errors, setErrors] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Partial<User> = {};
    if (!user.name.trim()) newErrors.name = "Name is required";
    if (!user.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Invalid email";
    if (user.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!user.phoneNumber.match(/^\d{10}$/)) newErrors.phoneNumber = "Invalid phone number";
    if (!user.dob) newErrors.dob = "Date of Birth is required";
    if (!user.branch) newErrors.branch = "Branch is required";
    if (!user.semester) newErrors.semester = "Semester is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await axios.post(`http://147.93.27.245:8001/auth/register`, user);
      alert("User registered successfully!");
      localStorage.setItem("userRegistered", "true");
      onRegister();
    } catch (error) {
      alert("Error registering user. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-3">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow border-0 rounded-4">
            <div className="card-body p-4">
              <h2 className="text-center text-dark fw-bold mb-4 title-animation">Register</h2>
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {[{ label: "Full Name", name: "name", type: "text" },
                    { label: "Email", name: "email", type: "email" },
                    { label: "Password", name: "password", type: "password" },
                    { label: "Phone Number", name: "phoneNumber", type: "tel" },
                    { label: "Date of Birth", name: "dob", type: "date" }]
                    .map((field, index) => (
                    <div className="col-md-6" key={field.name}>
                      <label className={`form-label text-dark fw-semibold label-animation delay-${index + 1}`}>
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        className="form-control rounded-3 input-green animated-input"
                        name={field.name}
                        value={user[field.name as keyof User]}
                        onChange={handleChange}
                        required
                      />
                      {errors[field.name as keyof User] && <p className="text-danger">{errors[field.name as keyof User]}</p>}
                    </div>
                  ))}

                  <div className="col-md-6">
                    <label className="form-label text-dark fw-semibold label-animation delay-6">Branch</label>
                    <select
                      className="form-select rounded-3 input-green animated-input"
                      name="branch"
                      value={user.branch}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Branch</option>
                      <option value="CSE">CSE</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                      <option value="Architectural">Architecture</option>
                    </select>
                    {errors.branch && <p className="text-danger">{errors.branch}</p>}
                  </div>

                  <div className="col-md-12">
                    <label className="form-label text-dark fw-semibold label-animation delay-7">Semester</label>
                    <select
                      className="form-select rounded-3 input-green animated-input"
                      name="semester"
                      value={user.semester}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Semester</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </select>
                    {errors.semester && <p className="text-danger">{errors.semester}</p>}
                  </div>
                </div>

                <button type="submit" className="btn btn-green w-100 mt-3 rounded-3 fw-bold glowing-btn" disabled={loading}>
                  {loading ? "Registering..." : "Register"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
