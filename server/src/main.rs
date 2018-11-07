// #[macro_use]
extern crate actix;
extern crate actix_web;
extern crate failure;
extern crate serde;
// #[macro_use]
extern crate serde_derive;
extern crate serde_json;


mod data;
mod server;

use actix::prelude::*;

use actix_web::server::HttpServer;
use actix_web::{ws, http, App, Error, HttpRequest, HttpResponse};

pub struct SessionState {
    addr: Addr<server::Server>,
}

pub struct Session {

}

fn chat_route(request: &HttpRequest<SessionState>) -> Result<HttpResponse, Error> {
    ws::start(
        request,
        Session {},
    )
}

impl Actor for Session {
    type Context = ws::WebsocketContext<Self, SessionState>;

    fn started(&mut self, _: &mut Self::Context) {
        println!("Session actor started!");
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        println!("Session actor stopping!"); 
        Running::Stop
    }
}

impl Handler<server::Message> for Session {
    type Result = (); 
    fn handle(&mut self, msg: server::Message, ctx: &mut Self::Context) {
        ctx.text(msg.0);
    }
}

impl StreamHandler<ws::Message, ws::ProtocolError> for Session {
    fn handle(&mut self, msg: ws::Message, ctx: &mut Self::Context) {
        println!("Received websocket message in session: {:?}", msg);
        match msg {
        | ws::Message::Text(text) => {
            ctx.state()
                .addr
                .do_send(server::Message(text));
        }
        | ws::Message::Close(_) => {
            ctx.stop();
        }
        | _ => (),
        }
    }
}

fn main() {
    let sys = actix::System::new("basic");
    let server = Arbiter::start(|_| server::Server);
    
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
