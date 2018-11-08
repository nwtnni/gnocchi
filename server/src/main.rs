// #[macro_use]
extern crate actix;
extern crate actix_web;
extern crate failure;
extern crate futures;
extern crate serde;
// #[macro_use]
extern crate serde_derive;
extern crate serde_json;

extern crate model;

mod data;
mod server;

use actix::prelude::*;

use actix_web::server::HttpServer;
use actix_web::{ws, App, Error, HttpRequest, HttpResponse};

pub struct SessionState {
    addr: Addr<server::Server>,
}

pub struct Session {
    player: usize,
}

fn chat_route(request: &HttpRequest<SessionState>) -> Result<HttpResponse, Error> {
    ws::start(
        request,
        Session { player: 0 },
    )
}

impl Actor for Session {
    type Context = ws::WebsocketContext<Self, SessionState>;

    fn started(&mut self, ctx: &mut Self::Context) {
        let addr = ctx.address();
        ctx.state()
            .addr
            .send(server::Connect {
                addr: addr.recipient(),
            })
            .into_actor(self)
            .then(|res, act, ctx| {
                match res {
                | Ok(player) => act.player = player,
                | _          => ctx.stop(),
                }
                actix::fut::ok(())
            })
            .wait(ctx);
    }

    fn stopping(&mut self, ctx: &mut Self::Context) -> Running {
        println!("Session actor stopping!"); 
        ctx.state().addr.do_send(server::Disconnect { player: self.player });
        Running::Stop
    }
}

impl Handler<server::Pos> for Session {
    type Result = (); 
    fn handle(&mut self, msg: server::Pos, ctx: &mut Self::Context) {
        ctx.text(format!("{},{},{}", msg.0, msg.1, msg.2));
    }
}

impl StreamHandler<ws::Message, ws::ProtocolError> for Session {
    fn handle(&mut self, msg: ws::Message, ctx: &mut Self::Context) {
        println!("Received websocket message in session: {:?}", msg);

        let dir = match &msg {
        | ws::Message::Text(dir) => {
            match dir.as_ref() {
            | "N" => Some(model::interact::Dir::N),
            | "S" => Some(model::interact::Dir::S),
            | "E" => Some(model::interact::Dir::E),
            | "W" => Some(model::interact::Dir::W),
            | "U" => Some(model::interact::Dir::U),
            | "D" => Some(model::interact::Dir::D),
            | _   => None,
            }
        }
        | _ => None,
        };

        if let Some(dir) = dir {
            ctx.state()
                .addr
                .do_send(server::Move {
                    player: self.player,  
                    direction: dir, 
                    magnitude: 0.0005,
                });
        } else if let ws::Message::Close(_) = msg {
            ctx.stop();
        }
    }
}

fn main() {
    let sys = actix::System::new("basic");
    let server = Arbiter::start(|_| server::Server::default());
    
    HttpServer::new(move || {
            let state = SessionState {
                addr: server.clone(),
            };

            App::with_state(state)
                .resource("/ws/", |r| r.route().f(chat_route))
        })
        .bind("localhost:8080")
        .unwrap()
        .start();
    
    println!("Started HTTP server at localhost:8080");
    let _ = sys.run();
}
