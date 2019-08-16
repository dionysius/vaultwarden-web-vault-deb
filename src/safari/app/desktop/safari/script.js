document.addEventListener("DOMContentLoaded", (event) => {
                          safari.extension.dispatchMessage("bitwarden", { hello: "world!!!" });
                          
                          safari.self.addEventListener("message", (e) => {
                                                       console.log(e);
                                                       
                                                       });
});
