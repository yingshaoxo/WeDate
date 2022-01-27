export type locationType = { lat: number, lng: number }

export type OneRecordOfMessage = {
    content: string,
    senderId: string,
    receiverId: string,
    date: number,
}