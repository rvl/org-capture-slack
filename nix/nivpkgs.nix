{ sources ? import ./sources.nix }:
let
  overlay = self: pkgs: { };
in
  import sources.nixpkgs
    { overlays = [ overlay ] ; config = {}; }
