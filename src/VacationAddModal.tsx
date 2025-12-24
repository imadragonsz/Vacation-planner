import React, { useState } from "react";
import "./styles/VacationAddModal.css";

interface VacationAddModalProps {
  onClose: () => void;
  onSubmit: (data: VacationData) => void;
  themeVars: any;
  style?: React.CSSProperties; // Added optional style prop
}

interface VacationData {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
}

const VacationAddModal: React.FC<VacationAddModalProps> = ({
  onClose,
  onSubmit,
  themeVars,
  style,
}) => {
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !destination || !startDate || !endDate) {
      alert("All fields are required to add a vacation.");
      return;
    }

    console.log("Submitting vacation:", {
      name,
      destination,
      startDate,
      endDate,
    });

    onSubmit({ name, destination, startDate, endDate });
    onClose();
  };

  return (
    <div
      className="vacation-add-modal"
      style={{
        background: themeVars.background,
        color: themeVars.textColor,
        ...style, // Merged inline styles
      }}
    >
      <div
        className="modal-content"
        style={{
          background: themeVars.modalBackground,
          color: themeVars.modalTextColor,
        }}
      >
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h2>Add Vacation</h2>
        <form onSubmit={handleSubmit} className="vacation-form">
          <input
            type="text"
            placeholder="Trip Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="vp-input"
          />
          <input
            type="text"
            placeholder="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            className="vp-input"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="vp-input"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="vp-input"
          />
          <button type="submit" className="vp-button">
            Add Vacation
          </button>
        </form>
      </div>
    </div>
  );
};

export default VacationAddModal;
