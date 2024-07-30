import { useContext, useEffect, useState } from 'react';
import {
    Button,
    Col,
    Row,
    Form,
    Table,
    Modal,
    message,
    Input,
    Checkbox,
    Select
} from 'antd';
import teacherApi from '../../apis/urlApi';
import { FeeList } from '../../types/response';
import { YearContext } from '../../context/YearProvider/YearProvider';
import Loader from '../../common/Loader';
import axios from 'axios';
import { number } from 'yup';

const { Option } = Select;

interface FeePrice {
    price: number;
    gradeId: number;
    unitId: number;
    unit: { name: string };
}

interface FeeForm {
    title: string;
    term: string;
    compel: boolean;
    status: boolean;
    refund: boolean;
    paymentTimeId: number;
    feePriceList: FeePrice[];
}

export default function SchoolYearClass() {
    const [fee, setFee] = useState<FeeList[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const { idYear } = useContext(YearContext);
    const [isLoading, setIsLoading] = useState(true);
    const [paymentTime, setPaymentTime] = useState<any[]>([]);
    const [unit, setUnit] = useState<any[]>([]);
    const [grade, setGrades] = useState<any[]>([]);


    const fetchData = async (idYear: any) => {
        if (idYear === null) return;
        setIsLoading(true);
        try {
            const res = await teacherApi.getFeeList(idYear);
            setFee(res.data);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                setFee([]);
            } else if (error instanceof Error) {
                console.error('Failed to fetch:', error.message);
            } else {
                console.error('An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
        }

    };

    useEffect(() => {
        handleSubmit();
        fetchData(idYear);
    }, [idYear])

    useEffect(() => {
        const fetchPaymentTime = async () => {
            try {
                setIsLoading(true);
                const res = await teacherApi.getScope();
                setPaymentTime(res.data.paymentTimeList);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching scope:', error);
                setIsLoading(false);
            }
        };
        fetchPaymentTime();
    }, []);

    useEffect(() => {
        const fetchUnit = async () => {
            try {
                setIsLoading(true);
                const res = await teacherApi.getScope();
                setUnit(res.data.unitList);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching scope:', error);
                setIsLoading(false);
            }
        };
        fetchUnit();
    }, []);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                setIsLoading(true);
                const res = await teacherApi.getGrades();
                setGrades(res.data.body);
            } catch (error) {
                console.error('Error fetching grade:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGrades();
    }, []);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async () => {
        try {
            const formData: FeeForm = await form.validateFields();
            formData.paymentTimeId = idYear as number;

            const feePriceList: FeePrice[] = formData.feePriceList.map((item) => ({
                price: item.price,
                gradeId: item.gradeId,
                unitId: item.unitId,
                unit: { name: 'Unit Name' } // Replace 'Unit Name' with the appropriate unit name
            }));

            const dataToSubmit = {
                title: formData.title,
                term: formData.term,
                compel: formData.compel,
                status: formData.status,
                refund: formData.refund,
                paymentTimeId: formData.paymentTimeId,
                schoolYearId: idYear as number,
                feePriceList: feePriceList,
            };

            const res = await teacherApi.postFeeList(dataToSubmit);
            setIsModalOpen(false);
            message.success('Tạo thành công!');
            setFee([...fee, res?.data]);
            fetchData(idYear);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const gradeMap = {
        1: "Khối 1",
        2: "Khối 2",
        3: "Khối 3",
        4: "Khối 4",
        5: "Khối 5",
    } as { [key: number]: string };

    return (
        <div className="p-4 md:p-6 2xl:p-10">
            <Row className="mb-6">
                <Col>
                    <Button type="default" onClick={showModal}>
                        Thêm khoản thu
                    </Button>
                </Col>
            </Row>
            <Modal
                title="Thêm khoản thu"
                visible={isModalOpen}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        Huỷ
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleSubmit}>
                        Xác nhận
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    name="addSchoolYearFeeForm"
                    labelCol={{ flex: '110px' }}
                    labelAlign="left"
                    labelWrap
                    wrapperCol={{ flex: 1 }}
                    colon={false}
                    className='mt-5'
                >
                    <Form.Item
                        label="Tên khoản thu"
                        name="title"
                        rules={[{ required: true, message: 'Please enter the fee name!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Row>
                        <Col span={12}>
                            <Form.Item
                                label="Thu theo kỳ"
                                name="term"
                                valuePropName="checked"
                            >
                                <Checkbox />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Bắt buộc"
                                name="compel"
                                valuePropName="checked"
                            >
                                <Checkbox />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item
                                label="Status"
                                name="status"
                                valuePropName="checked"
                            >
                                <Checkbox />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Hoàn tiền"
                                name="refund"
                                valuePropName="checked"
                            >
                                <Checkbox />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        label="Thời hạn thu"
                        name="paymentTimeId"
                        rules={[{ required: true, message: 'Please select the payment time!' }]}
                    >
                        <Select>
                            {paymentTime?.map((time) => (
                                <Option key={time.id} value={time.id}>
                                    {time.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.List name="feePriceList">
                        {(fields, { add, remove }) => (
                            <>
                                {fields?.map(({ key, name, fieldKey = `${key}`, ...restField }) => (
                                    <Row gutter={16} key={key}>
                                        <Col span={8}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'price']}
                                                fieldKey={[fieldKey, 'price']}
                                                rules={[{ required: true, message: 'Please enter the price!' }]}
                                            >
                                                <Input placeholder="Số tiền" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'gradeId']}
                                                fieldKey={[fieldKey, 'gradeId']}
                                                rules={[{ required: true, message: 'Please enter the grade ID!' }]}
                                            >
                                                <Select placeholder='Khối'>
                                                    {grade?.map((grade) => (
                                                        <Select.Option key={grade.id} value={grade.id}>
                                                            {grade.name}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'unitId']}
                                                fieldKey={[fieldKey, 'unitId']}
                                                rules={[{ required: true, message: 'Please select the unit!' }]}
                                            >
                                                <Select placeholder='Đơn vị'>
                                                    {unit?.map((time) => (
                                                        <Option key={time.id} value={time.id}>
                                                            {time.name}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={24} className='mb-3'>
                                            <Button type='default' onClick={() => remove(name)}>
                                                Xoá
                                            </Button>
                                        </Col>
                                    </Row>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block>
                                        Thêm mức giá
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>
            {isLoading ? (
                <Loader />
            ) : (
                <div>
                    <Row justify="space-between" className="mb-6">
                        <Table
                            dataSource={fee}
                            rowKey={(record) => (record.id !== undefined ? record.id : `temp-key-${record.title}`)}
                            scroll={{ y: 450 }}
                            className="w-full"
                        >
                            <Table.Column title="Tên khoản thu" dataIndex="title" />
                            <Table.ColumnGroup title="Đơn giá">
                                <Table.Column
                                    title="Giá"
                                    dataIndex="feePrices"
                                    key="price"
                                    render={(feePrices: FeePrice[]) => (
                                        <>
                                            {feePrices?.map((price: FeePrice, index: number) => (
                                                <div className='mb-1 mt-1 border-b-2 border-bodydark1' key={index}>
                                                    {price.price}
                                                </div>
                                            ))}
                                        </>
                                    )}
                                />
                                <Table.Column
                                    title="Đơn vị"
                                    dataIndex="feePrices"
                                    key="unit"
                                    render={(feePrices: FeePrice[]) => (
                                        <>
                                            {feePrices?.map((price: FeePrice, index: number) => (
                                                <div className='mb-1 mt-1 border-b-2 border-bodydark1' key={index}>
                                                    {price.unit.name}
                                                </div>
                                            ))}
                                        </>
                                    )}
                                />
                                <Table.Column
                                    title="Khối"
                                    dataIndex="feePrices"
                                    key="gradeId"
                                    render={(feePrices: FeePrice[]) => (
                                        <>
                                            {feePrices?.map((price: FeePrice, index: number) => (
                                                <div className='mb-1 mt-1 border-b-2 border-bodydark1' key={index}>
                                                    {gradeMap[price.gradeId] || price.gradeId}
                                                </div>
                                            ))}
                                        </>
                                    )}
                                />
                            </Table.ColumnGroup>
                            <Table.Column title="Kỳ thu" dataIndex="termName" />
                            <Table.Column
                                title="Thời gian thu"
                                dataIndex="paymentTime"
                                render={(paymentTime) => paymentTime.name}
                            />
                        </Table>
                    </Row>
                </div>
            )}
        </div>
    );
}
