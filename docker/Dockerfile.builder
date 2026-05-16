FROM rust:1.75-bookworm
RUN rustup target add wasm32-unknown-unknown
WORKDIR /build
