use std::collections::HashMap;

use actix::prelude::*;
use model::{World, Flat};

#[derive(Message)]
pub struct Move {
    pub player: usize,
    pub direction: model::interact::Dir, 
    pub magnitude: f32,
}

#[derive(Message)]
#[rtype(usize)]
pub struct Connect {
    pub addr: Recipient<Pos>,
}

#[derive(Message)]
pub struct Disconnect {
    pub player: usize,
}

#[derive(Message, Copy, Clone, Debug)]
pub struct Pos(pub f32, pub f32, pub f32);

#[derive(Default)]
pub struct Server {
    connected: HashMap<usize, Recipient<Pos>>,
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
        player 
    }
}

impl Handler<Disconnect> for Server {
    type Result = ();
    
    fn handle(&mut self, disconnect: Disconnect, _: &mut Context<Self>) -> Self::Result {
        self.connected.remove(&disconnect.player);
    }
}

impl Handler<Move> for Server {
    type Result = ();

    fn handle(&mut self, movement: Move, _: &mut Context<Self>) -> Self::Result {
        let next = self.world.try_move(movement.player, movement.direction, movement.magnitude);
        let next = Pos(next.0, next.1, next.2);
        self.connected[&movement.player].do_send(next);
    }
}
