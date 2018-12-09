use std::collections::HashMap;
use std::iter;

use actix::prelude::*;
use model::{World, Debug, data};
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
    world: World<Debug>,
}

impl Actor for Server {
    type Context = Context<Self>;
}

impl Handler<Connect> for Server {
    type Result = usize;

    fn handle(&mut self, connect: Connect, _: &mut Context<Self>) -> Self::Result {
        let player = self.connected.len();
        println!("Player {} connecting...", player);

        let register = message::Outgoing::RegisterData{ id: player };

        connect.addr
            .do_send(register)
            .expect("[INTERNAL ERROR]: failed to send registration data");

        let (position, meshes) = self.world.connect(player);

        let entity = message::Outgoing::EntityData {
            id: player,
            position,
        };

        for addr in iter::once(&connect.addr).chain(self.connected.values()) {
            addr.do_send(entity.clone()).ok();
        }

        for player in self.connected.keys() {
            let position = self.world.get_position(*player)
                .expect("[INTERNAL ERROR]: player missing position");
            
            let entity = message::Outgoing::EntityData {
                id: *player,
                position,
            };

            connect.addr.do_send(entity).ok();
        }

        for mesh in meshes {
            let mesh = message::Outgoing::ChunkData(mesh);
            connect.addr
                .do_send(mesh)
                .expect("[INTERNAL ERROR]: failed to send chunk");
        }

        self.connected.insert(player, connect.addr);
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
            let (next, loaded) = self.world.translate(player, direction);
            let address = &self.connected[&player];
            for mesh in loaded {
                let mesh = message::Outgoing::ChunkData(mesh);
                address
                    .do_send(mesh)
                    .expect("[INTERNAL ERROR]: failed to send chunk");
            }

            let entity = message::Outgoing::EntityData {
                id: player,
                position: next,
            };

            for address in self.connected.values() {
                address.do_send(entity.clone()).ok();
            }
        },
        | _ => unimplemented!(),
        }
    }
}
