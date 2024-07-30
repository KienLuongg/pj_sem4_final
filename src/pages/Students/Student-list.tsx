import {
  Button,
  Form,
  Input,
  Table,
  Modal,
  Radio,
  DatePicker,
  notification,
  Select,
  Row,
  Col,

} from 'antd';
import { useContext, useEffect, useState } from 'react';
import mainAxios from '../../apis/main-axios';
import { SchoolYearClassData, Student } from '../../types/response';
import teacherApi from '../../apis/urlApi';
import { YearContext } from '../../context/YearProvider/YearProvider';
import Loader from '../../common/Loader';
import axios from 'axios';

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolYearClassData[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [form] = Form.useForm();
  const { idYear } = useContext(YearContext);
  const [schoolYearClass, setSchoolYearClass] = useState<SchoolYearClassData[]>([]);

  useEffect(() => {
    const fetchClass = async () => {
      if (idYear === null) return;
      setIsLoading(true);
      try {
        const res = await teacherApi.getSchoolYearClass(idYear);
        const classData = res?.data;
        setClasses(classData);
        if (classData.length > 0) {
          setSelectedClassId(classData[0].id);
        }

        setIsLoading(false);
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setClasses([]);
          setIsLoading(false);
        } else if (error instanceof Error) {
          console.error('Failed to fetch students:', error.message);
        } else {
          console.error('An unknown error occurred.');
        }
      }
    };
    fetchClass();
  }, [idYear]);




  useEffect(() => {
    const fetchStudentsByClass = async () => {
      if (selectedClassId === null) return;
      setIsLoading(true);
      try {
        const res = await teacherApi.getStudentByClass(selectedClassId);
        setStudents(res?.data);
        setIsLoading(false);
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setStudents([]);
          setIsLoading(false);
        } else if (error instanceof Error) {
          console.error('Failed to fetch students:', error.message);
        } else {
          console.error('An unknown error occurred.');
        }
      }
    };
    fetchStudentsByClass();
  }, [selectedClassId]);


  // Function to open the modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const formData = await form.validateFields();
      await mainAxios.post('/api/v1/student', formData);
      notification.success({
        message: 'Thành công',
      });
      setIsModalOpen(false);
    } catch (error: any) {
      if (error.response.message) {
        notification.error({ message: error.response.message });
      }
    }
  };

  const renderStudentStatuses = (record: Student) => {
    return record.students.studentStatuses
      .map((status) => status.description)
      .join(', ');
  };

  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <Row className="mb-4">
        <Col>
          <Button type="default" onClick={showModal}>
            Thêm
          </Button>
        </Col>
        <Col className='ml-3'>
          <Select
            className='w-25'
            placeholder='Lớp'
            value={selectedClassId}
            onChange={(value) => setSelectedClassId(value)}
          >
            {classes.map((cls) => (
              <Select.Option key={cls.id} value={cls.id}>
                {cls.className}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Modal
        title="Thêm học sinh"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            Submit
          </Button>,
        ]}
      >
        <div>
          <Form
            form={form}
            name="wrap"
            labelCol={{ flex: '110px' }}
            labelAlign="left"
            labelWrap
            wrapperCol={{ flex: 1 }}
            colon={false}
            className="max-w-[600px] mx-auto"
          >
            <Form.Item
              label="Họ:"
              name="lastName"
              rules={[{ required: true, message: 'Please input!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Tên:"
              name="firstName"
              rules={[{ required: true, message: 'Please input!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Ngày sinh:"
              name="birthday"
              rules={[{ required: true, message: 'Please input!' }]}
            >
              <DatePicker />
            </Form.Item>

            <Form.Item
              label="Giới tính:"
              name="gender"
              rules={[{ required: true, message: 'Please select!' }]}
            >
              <Radio.Group>
                <Radio value="true">Nam</Radio>
                <Radio value="false">Nữ</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="Địa chỉ:"
              name="address"
              rules={[{ required: true, message: 'Please input!' }]}
            >
              <Input.TextArea autoSize={{ minRows: 1, maxRows: 6 }} />
            </Form.Item>

            <Form.Item
              label="Mã học sinh:"
              name="studentCode"
              rules={[{ required: true, message: 'Please input!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Lớp:"
              name="schoolYearClassId"
              rules={[{ required: true, message: 'Please select!' }]}
            >
              <Select>
                {classes.map((cls) => (
                  <Select.Option key={cls.id} value={cls.id}>
                    {cls.className}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Table displaying the list of students */}
      {isLoading ? (
        <Loader />
      ) : (
        <Table dataSource={students} rowKey="id">
          <Table.Column
            title="Mã học sinh"
            render={(text, record: Student) => `${record.students.studentCode}`}
          />
          <Table.Column
            title="Họ và tên"
            render={(text, record: Student) =>
              `${record.students.firstName} ${record.students.lastName}`
            }
          />
          <Table.Column
            title="Ngày sinh"
            render={(text, record: Student) => {
              const date = new Date(record.students.birthday);
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
              const year = date.getFullYear();
              return `${day}/${month}/${year}`;
            }}
          />
          <Table.Column
            title="Giới tính"
            render={(text, record: Student) => `${record.students.studentCode}`}
          />
          <Table.Column
            title="Địa chỉ"
            render={(text, record: Student) => `${record.students.address}`}
          />
          <Table.Column title="Trạng thái" render={renderStudentStatuses} />
        </Table>
      )}
    </div>
  );
}
