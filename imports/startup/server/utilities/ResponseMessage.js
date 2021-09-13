export class ResponseMessage {
    constructor(){
        this.message = null;
        this.description = null;
        this.data = null;
    }
    
    create(message, description = null, data = null){
        this.message = message;
        this.description = description;
        this.data = data;
    }
}