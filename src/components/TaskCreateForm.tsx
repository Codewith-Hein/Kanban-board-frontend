import { Button, Form, Input, InputNumber, message, Select } from "antd";
import { useState } from "react";
import { createTask } from "../service/taskApi";
const TaskCreateForm = () => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: {
    title: string;
    description: string;
    position: number;
    columnId: number;
  }) => {
    try {
      setLoading(true);

      await createTask(values);

      message.success("Task Create Successfully");
      form.resetFields();
    } catch (error) {
      console.log("create task fail", error);
      message.error("failed to created task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        label="Task title"
        name="title"
        rules={[{ required: true, message: "please enter a title" }]}
      >
        <Input placeholder="Enter task title"></Input>
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true, message: "please enter a description" }]}
      >
        <Input placeholder="Enter task description"></Input>
      </Form.Item>

      <Form.Item
        label="Position"
        name="position"
        rules={[{ required: true, message: "please enter a position" }]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        label="ColumnId"
        name="columnId"
        rules={[{ required: true, message: "please enter a columnID" }]}
      >
        <Select
          style={{ marginRight: 10 }}
          placeholder="Select a column"
          options={[
            { label: "To Do", value: 1 },
            { label: "Inprogress", value: 2 },
            { label: "Done", value: 3 },
          ]}
        />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={loading}>
        Create Task
      </Button>
    </Form>
  );
};

export default TaskCreateForm;
