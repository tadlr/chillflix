const log = console.log;

class NetworkError extends Error {
  constructor(msg, response) {
    super(msg);
    this.name = "NetworkError";
    if (typeof response == Object) {
      this.response = response;
      this.status = response.status;
      this.statusText = response.statusText;
    }
  }
}

class ErrorHandler extends NetworkError {
  constructor(msg, response, status) {
    super(msg);
    this.name = "NetworkError";
    // console.error(response);
    let classes = ["alert", "alert-dismissible", "fade", "show"];
    const alert = document.createElement("div");
    alert.setAttribute("role", "alert");
    alert.innerHTML = `${msg} ${response}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;

    switch (status) {
      case "error":
        classes.push("alert-danger");

        break;
      case "alert":
        classes.push("alert-warning");
        break;

      default:
        classes.push("alert-primary");
        break;
    }

    const randID = (Math.random() + 1).toString(36).substring(7);
    alert.setAttribute("id", randID);

    alert.classList.add(...classes);
    document.getElementById("messages").prepend(alert);

    setTimeout(() => {
      const alertBox = bootstrap.Alert.getOrCreateInstance("#" + randID);
      alertBox.close();
    }, 10500);
  }
}

export { NetworkError, ErrorHandler, log };
