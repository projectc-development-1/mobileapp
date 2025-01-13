import { useState } from 'react';

type Message = {
    _id: number;
    text: string;
    createdAt: Date;
    user: {
        _id: number;
        name: string;
        avatar: string;
    };
};

function MarkerClickAction (){
    const [chatboxVisible, setChatboxVisible] = useState(false);
    const [message, setMessage] = useState('');

    const handleMarkerClick = (event: any) => {
        console.log('Marker clicked!', event.nativeEvent);
        setChatboxVisible(!chatboxVisible);
    };

    const handleSendMessage = () => {
        console.log('Message sent:', message);
        setMessage('');
    };

    return {
        handleMarkerClick,
        chatboxVisible,
        message,
        handleSendMessage,
        setMessage
    };
};

export default MarkerClickAction;