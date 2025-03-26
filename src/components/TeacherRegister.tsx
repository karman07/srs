import React, { useState, useEffect } from "react";
import axios from "axios";

interface Props {
  setScreen: (screen: string) => void;
}

const TeacherForm: React.FC<Props> = ({ setScreen }) => {
  const [teacher, setTeacher] = useState({
    name: "",
    branches: [] as string[],
    semesters: [] as string[],
    subjects: [] as string[],
  });

  const [newSubject, setNewSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setBranches(["CSE", "ECE", "ME", "Civil"]);
      setSemesters(["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"]);
      setLoading(false);
    }, 2000);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeacher({ ...teacher, [e.target.name]: e.target.value });
  };

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>, key: keyof typeof teacher) => {
    setTeacher({ ...teacher, [key]: [e.target.value] });
  };

  const addSubject = () => {
    if (newSubject.trim() !== "" && !teacher.subjects.includes(newSubject)) {
      setTeacher({ ...teacher, subjects: [...teacher.subjects, newSubject] });
      setNewSubject("");
    }
  };

  const removeSubject = (subject: string) => {
    setTeacher({ ...teacher, subjects: teacher.subjects.filter((sub) => sub !== subject) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/teachers", teacher);
      setScreen("thankyou"); // Navigate to Thank You screen
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div className="card p-4 shadow-lg w-100 text-center border-0" style={{ maxWidth: "1000px", backgroundColor: "#f5f5f5" }}>
        <h2 className="text-center" style={{ color: "darkgreen", fontWeight: "bold" }}>Teacher Registration</h2>
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-3">
            <label className="form-label fw-bold">Name</label>
            <input type="text" className="form-control text-center border-2" name="name" value={teacher.name} onChange={handleChange} required />
          </div>

          {/* Branches Dropdown */}
          <div className="mb-3">
            <label className="form-label fw-bold">Branches</label>
            {loading ? (
              <div className="spinner-border text-success" role="status"></div>
            ) : (
              <select className="form-select text-center border-2" onChange={(e) => handleDropdownChange(e, "branches")}>
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            )}
          </div>

          {/* Semesters Dropdown */}
          <div className="mb-3">
            <label className="form-label fw-bold">Semesters</label>
            {loading ? (
              <div className="spinner-border text-success" role="status"></div>
            ) : (
              <select className="form-select text-center border-2" onChange={(e) => handleDropdownChange(e, "semesters")}>
                <option value="">Select Semester</option>
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            )}
          </div>

          {/* Subjects */}
          <div className="mb-3">
            <label className="form-label fw-bold">Subjects</label>
            <div className="input-group">
              <input type="text" className="form-control text-center border-2" placeholder="Enter Subject" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} />
              <button type="button" className="btn text-white" style={{ backgroundColor: "darkgreen" }} onClick={addSubject}>Add</button>
            </div>
          </div>

          {/* Subject Cards */}
          <div className="row">
            {teacher.subjects.map((subject, index) => (
              <div key={index} className="col-md-4">
                <div className="card p-3 m-2 text-center shadow-sm border-0">
                  <p className="text-dark">{subject}</p>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeSubject(subject)}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="btn text-white w-100 mt-3" style={{ backgroundColor: "darkgreen", fontWeight: "bold" }}>
            Register Teacher
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;
