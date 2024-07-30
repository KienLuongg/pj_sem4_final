import { useEffect, useState } from 'react';
import {
  Button,
  Col,
  Row,
  Form,
  Input,
  Table,
  Modal,
  DatePicker,
  message,
} from 'antd';
import moment from 'moment';
import Loader from '../../common/Loader';
import teacherApi from '../../apis/urlApi';
import { SchoolYearsData } from '../../types/response';

export default function SchoolYears() {
  const [schoolYears, setSchoolYears] = useState<SchoolYearsData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(true);
  console.log(schoolYears);
  useEffect(() => {
    fetchData();
    console.log('aaaa', fetchData);
  }, []);
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await teacherApi.getSchoolYear();
      setSchoolYears(res.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const formData = await form.validateFields();
      await teacherApi.postCreateSchoolYear(formData);
      setIsModalOpen(false);
      fetchData();
      message.success('Data submitted successfully!');
    } catch (error: any) {
      if (error.response) {
        console.error('Server Error:', error.response.data);
      } else if (error.request) {
        console.error('Network Error:', error.request);
      } else {
        console.error('Error:', error.message);
      }
      message.error('Failed to submit data. Please try again later.');
    }
  };

  return (
    <div className="p-4 md:p-6 2xl:p-10">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <Row className="mb-4">
            <Col span={12}>
              <Input
                type="text"
                placeholder="Tìm theo năm"
                className="w-full md:w-3/4"
              />
            </Col>
            <Col span={12} className="text-right">
              <Button type="default" onClick={showModal} className="">
                Thêm
              </Button>
              <Modal
                title="Thêm năm học"
                visible={isModalOpen}
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
                <Form
                  form={form}
                  name="addSchoolYearForm"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                >
                  <Form.Item
                    label="Thời gian bắt đầu học kỳ I:"
                    name="startSem1"
                    rules={[
                      {
                        required: true,
                        message: 'Please input start date for semester 1!',
                      },
                    ]}
                  >
                    <DatePicker className="w-full" />
                  </Form.Item>
                  <Form.Item
                    label="Thời gian bắt đầu học kỳ II:"
                    name="startSem2"
                    rules={[
                      {
                        required: true,
                        message: 'Please input start date for semester 2!',
                      },
                    ]}
                  >
                    <DatePicker className="w-full" />
                  </Form.Item>
                  <Form.Item
                    label="Thời gian kết thúc:"
                    name="end"
                    rules={[
                      { required: true, message: 'Please input end date!' },
                    ]}
                  >
                    <DatePicker className="w-full" />
                  </Form.Item>
                </Form>
              </Modal>
            </Col>
          </Row>
          <Table
            dataSource={schoolYears}
            rowKey="id"
            className=" text-black dark:text-white"
          >
            <Table.Column title="Id" dataIndex="id" />
            <Table.Column
              title="Học kỳ 1"
              dataIndex="startSem1"
              render={(date) => moment(date).format('DD/MM/YYYY')}
            />
            <Table.Column
              title="Học kỳ 2"
              dataIndex="startSem2"
              render={(date) => moment(date).format('DD/MM/YYYY')}
            />
            <Table.Column
              title="Kết thúc"
              dataIndex="end"
              render={(date) => moment(date).format('DD/MM/YYYY')}
            />
          </Table>
        </>
      )}
    </div>
  );
}
