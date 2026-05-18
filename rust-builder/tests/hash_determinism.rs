use stellar_verify_builder::hasher::hash_wasm;

#[test]
fn same_bytes_same_hash() {
    let a = hash_wasm(b"wasm");
    let b = hash_wasm(b"wasm");
    assert_eq!(a, b);
}
