import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, Menu } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { getDeviceToken, onMessageListener } from '../firebase';
import mainAxios from '../apis/main-axios';

interface NotificationData {
  id: string;
  title: string;
  body: string;
}

const Notification: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    getDeviceToken();

    onMessageListener()
      .then((payload) => {
        if (payload.notification) {
          const newNotification = {
            id: payload.messageId ?? Math.random().toString(36).substr(2, 9), // generate a random ID if messageId is not available
            title: payload.notification.title ?? 'No Title',
            body: payload.notification.body ?? 'No Body',
          };
          setNotifications((prevNotifications) => [
            ...prevNotifications,
            newNotification,
          ]);
        }
        console.log(payload);
      })
      .catch((err) => console.log('Failed to receive foreground message', err));
  }, []);
  const [data, setData] = useState<any[]>();
  const handleChange = async() => {
    try {
      const res = await mainAxios.get(`/get-user-notifications?page=0&size=5`);
      setData(res?.data?.content);
      console.log(res?.data.content);
    } catch (error) {
      
    }
  }
  
  useEffect(() => {
    handleChange();
  }, []);

  const NotificationMenu = (
    <Menu>
      {data?.length === 0 ? (
        <Menu.Item key="no-notifications">No notifications</Menu.Item>
      ) : (
        data?.map((notification) => (
          <Menu.Item key={notification.id}>
            <strong>{notification.title}</strong>
            <p>{notification.body}</p>
          </Menu.Item>
        ))
      )}
    </Menu>
  );

  return (
    <Dropdown overlay={NotificationMenu} placement="bottomRight" arrow>
      <Badge count={data?.length} offset={[10, 0]}>
        <BellOutlined style={{ fontSize: '20px' }} />
      </Badge>
    </Dropdown>
  );
};

export default Notification;
