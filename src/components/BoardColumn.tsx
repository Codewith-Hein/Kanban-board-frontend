import React from "react";
import { Card } from "antd";

const BoardColumn: React.FC = () => (
  <div
    style={{
      display: "flex",
      gap: 16,
      overflowX: "auto",
      paddingBottom: 16,
      marginTop: 16,
      alignItems: "flex-start",
    }}
  >
    <Card
      title="Card title"
      variant="borderless"
      style={{
        width: 300,
        flexShrink: 0, // Stops columns from getting squished when you have 5+ columns!
        background: "#f4f5f7", // Soft gray column background
      }}
    >
      <Card
        size="small"
        variant="borderless"
        style={{ marginBottom: 10, background: "#fff" }}
      >
        Sample Task inside
      </Card>{" "}
      Card content
    </Card>
  </div>
);

export default BoardColumn;
