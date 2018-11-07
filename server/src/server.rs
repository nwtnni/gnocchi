use actix::prelude::*;

#[derive(Message)]
pub struct Message(pub String);

pub struct Server;

impl Actor for Server {
    type Context = Context<Self>;
}

impl Handler<Message> for Server {
    type Result = ();

    fn handle(&mut self, m: Message, _: &mut Context<Self>) -> Self::Result {
        println!("Received message: {}", m.0); 
    }
}
