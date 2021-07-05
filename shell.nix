{ pkgs ? import ./nix/nivpkgs.nix {} }:

with pkgs;

mkShell {
  buildInputs = [
    nodejs
    nodePackages.npm
    nodePackages.web-ext
    niv
  ];
}
