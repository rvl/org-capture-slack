{
  description = "org-capture-slack";

  inputs = {
    npmlock2nix.url = github:tweag/npmlock2nix;
    npmlock2nix.flake = false;
    utils.url = github:numtide/flake-utils;
  };

  outputs = { self, nixpkgs, utils, npmlock2nix }: let
    inherit (nixpkgs) lib;

    npmlock2nixArgs = pkgs: {
      src = self.sourceInfo;
      inherit (pkgs) nodejs; # Our target node version -- LTS.
      buildInputs = [];
      nativeBuildInputs = [];
      buildCommands = [
        "npm run build:firefox"
        "npm run package:firefox"
      ];
      doCheck = false;
      checkPhase = ''
        npm run test
      '';
      installPhase = ''
        cp -r dist $out
      '';
    };

  in {
    overlay = nixpkgs.lib.composeManyExtensions (nixpkgs.lib.attrValues self.overlays);
    overlays.dist = final: prev: {
      org-capture-slack = (prev.org-capture-slack or {}) // {
        firefox = final.npmlock2nix.build (npmlock2nixArgs final);

        # These XPIs need to be signed by addons.mozilla.org, so
        # there's no good pure way to build them under nix.
        xpi = final.fetchurl {
          url = "https://github.com/rvl/org-capture-slack/releases/download/v1.0.0/org_capture_slack-1.0-an+fx.xpi";
          sha256 = "1qvcqqz6m9hj3jszfjh378wk3qf668nf2fmvr4zb7dqancz8zrsn";
        };

        firefoxExtension = final.buildFirefoxExtension
          "org-capture-slack@rodney.id.au" {} final.org-capture-slack.xpi;
      };
    };
    overlays.builders = final: prev: {
      # Puts an XPI file in the correct location for the home-manager
      # firefox package.
      buildFirefoxExtension = let
        commonProfile = "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}";
      in
        id: args: xpi:
        final.runCommandNoCC "firefox-extension-${id}" args ''
         dir=$out/share/mozilla/extensions/${final.lib.escapeShellArg commonProfile}
         mkdir -p $dir
         cp ${xpi} $dir/${id}.xpi
       '';
    };
    overlays.deps = final: prev: {
      npmlock2nix = final.callPackage npmlock2nix { };
    };

  } // utils.lib.eachDefaultSystem (system: let
    pkgs = import nixpkgs {
      inherit system;
      overlays = [ self.overlay ];
    };
    flake = {
      defaultPackage = flake.packages.firefoxExtension;
      packages = {
        inherit (pkgs.org-capture-slack)
          firefox
          firefoxExtension;
      };
      devShell = flake.devShells.default;
      devShells = {
        default = pkgs.npmlock2nix.shell (npmlock2nixArgs pkgs);
        minimal = with (npmlock2nixArgs pkgs); pkgs.mkShell {
          name = "nix-shell-minimal";
          inherit buildInputs;
          nativeBuildInputs = nativeBuildInputs ++ [ nodejs ];
        };
      };
    };
  in
    flake);

  nixConfig.bash-prompt = "\\u@\\h:\\w \[$name\] \\$ ";
}
