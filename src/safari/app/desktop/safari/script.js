document.addEventListener("DOMContentLoaded", (event) => {
                          safari.extension.dispatchMessage("Hello World!", { key: "value2" });
                          
                          safari.self.addEventListener("message", (e) => {
                                                       console.log(e);
                                                       
                                                       });
});
