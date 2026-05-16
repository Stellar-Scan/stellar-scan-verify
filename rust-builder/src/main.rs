mod builder;
mod hasher;

fn main() {
    let dir = std::env::args().nth(1).unwrap_or_else(|| ".".into());
    match builder::build_contract(&dir) {
        Ok(res) => println!(r#"{{"hash":"{}","wasmPath":"{}"}}"#, res.hash, res.wasm_path),
        Err(e) => {
            eprintln!("{e}");
            std::process::exit(1);
        }
    }
}
