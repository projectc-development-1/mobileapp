interface Message {
    action: string;
    data:{
        messageID: string,
        from_account_id: string,
        from_account_name: string,
        to_account_id: string,
        to_account_name: string,
        msgtype: string,
        timestamp: number,
        read: boolean,
        sent: number,
        message: MessageContent,
    };
}

interface MessageContent {
    generalContent: string | '';
    audioContent: AudioContent | '';
    imageContent: ImageContent | '';
    videoContent: VideoContent | '';
}

interface AudioContent {
    fileName: string | '';
    audioInBase64: string | '';
    type: string | '';
}

interface ImageContent {
    fileName: string | '';
    photoOriginalInBase64: string | '';
    photoCompressedInBase64: string | '';
    type: string | '';
}

interface VideoContent {
    fileName: string | '';
    videoOriginalInBase64: string | '';
    thumbnailInBase64: string | '';
    type: string | '';
}

export { Message, MessageContent, ImageContent };