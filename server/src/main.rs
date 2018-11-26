#[macro_use]
extern crate actix;
extern crate actix_web;
extern crate failure;
extern crate futures;
extern crate nalgebra_glm as glm;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;

extern crate model;

mod message;
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

impl Handler<message::Outgoing> for Session {
    type Result = (); 
    fn handle(&mut self, msg: message::Outgoing, ctx: &mut Self::Context) {
        let response = serde_json::to_string(&msg)
            .expect("[INTERNAL ERROR]: failed to serialize outgoing message");
        ctx.text(response);
    }
}

impl StreamHandler<ws::Message, ws::ProtocolError> for Session {
    fn handle(&mut self, msg: ws::Message, ctx: &mut Self::Context) {
        println!("Received websocket message in session: {:?}", msg);

        match msg {
        | ws::Message::Text(dir) => {
            let incoming = serde_json::from_str(&dir)
                .map(|incoming| server::Incoming(self.player, incoming))
                .expect("[CLIENT ERROR]: could not parse JSON");

            ctx.state().addr.do_send(incoming);
        }
        | ws::Message::Close(_) => ctx.stop(),
        | _ => (),
        };
    }
}

fn main() {
    let sys = actix::System::new("basic");
    let server = Arbiter::start(|_| server::Server::default());
    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "8080".to_owned());
    
    HttpServer::new(move || {
            let state = SessionState {
                addr: server.clone(),
            };

            App::with_state(state)
                .resource("/ws/", |r| r.route().f(chat_route))
        })
        .bind(format!("localhost:{}", port))
        .unwrap()
        .start();
    
    println!("Listening on port {}", port);
    let _ = sys.run();
}
