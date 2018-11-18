use std::collections::HashMap;

use actix::prelude::*;
use model::{World, Flat};
use message;

#[derive(Message)]
#[rtype(usize)]
pub struct Connect {
    pub addr: Recipient<message::Outgoing>,
}

#[derive(Message)]
pub struct Incoming(pub usize, pub message::Incoming);

#[derive(Message)]
pub struct Disconnect {
    pub player: usize,
}

#[derive(Message, Copy, Clone, Debug)]
pub struct Pos(pub f32, pub f32, pub f32);

#[derive(Default)]
pub struct Server {
    connected: HashMap<usize, Recipient<message::Outgoing>>,
    world: World<Flat>,
}

impl Actor for Server {
    type Context = Context<Self>;
}

impl Handler<Connect> for Server {
    type Result = usize;

    fn handle(&mut self, connect: Connect, _: &mut Context<Self>) -> Self::Result {
        let player = self.connected.len();
        println!("Player {} connecting...", player);
        self.connected.insert(player, connect.addr);
        self.world.connect(player);
        player 
    }
}

impl Handler<Disconnect> for Server {
    type Result = ();
    
    fn handle(&mut self, disconnect: Disconnect, _: &mut Context<Self>) -> Self::Result {
        self.connected.remove(&disconnect.player);
        self.world.disconnect(disconnect.player);
    }
}

impl Handler<Incoming> for Server {
    type Result = ();

    fn handle(&mut self, Incoming(player, message): Incoming, _: &mut Context<Self>) -> Self::Result {
        match message {
        | message::Incoming::MoveData { direction } => {
            let next = self.world.try_move(player, direction, 0.01);
            let response = message::Outgoing::EntityData { id: player, position: next };
            self.connected[&player]
                .do_send(response)
                .expect("[INTERNAL ERROR]: failed to send response");
        },
        | _ => unimplemented!(),
        }
    }
}
