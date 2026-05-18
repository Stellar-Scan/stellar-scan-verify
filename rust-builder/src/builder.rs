use std::process::Command;

pub struct BuildResult {
    pub wasm_path: String,
    pub hash: String,
}

pub fn build_contract(crate_dir: &str) -> Result<BuildResult, String> {
    let status = Command::new("cargo")
        .args(["build", "--release", "--target", "wasm32-unknown-unknown"])
        .current_dir(crate_dir)
        .status()
        .map_err(|e| e.to_string())?;
    if !status.success() {
        return Err("cargo build failed".into());
    }
    let wasm_path = format!("{crate_dir}/target/wasm32-unknown-unknown/release/contract.wasm");
    let bytes = std::fs::read(&wasm_path).map_err(|e| e.to_string())?;
    Ok(BuildResult {
        hash: crate::hasher::hash_wasm(&bytes),
        wasm_path,
    })
}
