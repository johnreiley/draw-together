/**
* 
* @param message The message to be displayed
* @param duration The duration of the toast in milliseconds (1000 = 1 second)
*/
export const generateToast = (message, duration) => {
  var root = document.querySelector('#root');
  var toast = document.createElement('div');
  toast.classList.add('toast');

  var toastTitle = document.createElement('strong');
  toastTitle.classList.add('mr-auto');
  toastTitle.innerText = 'Draw Together';
  var toastClose = document.createElement('button');
  toastClose.innerHTML = `<span aria-hidden="true">&times;</span>`;
  toastClose.type = 'button';
  toastClose.classList.add('ml-2', 'mb-1', 'close');
  toastClose.setAttribute('data-dismiss', 'toast');
  toastClose.ariaLabel = 'Close';
  var toastHeader = document.createElement('div');
  toastHeader.classList.add('toast-header');
  toastHeader.appendChild(toastTitle);
  toastHeader.appendChild(toastClose);

  var toastBody = document.createElement('div');
  toastBody.classList.add('toast-body');
  toastBody.innerHTML = message;

  toast.appendChild(toastHeader);
  toast.appendChild(toastBody);

  // toast.innerHTML = `
  //   <div class="toast-header">
  //     <strong class="mr-auto">Draw Together</strong>
  //     <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
  //       <span aria-hidden="true">&times;</span>
  //     </button>
  //   </div>
  //   <div class="toast-body">
  //     ${message}
  //   </div>`;

  root.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-show');
  }, 20);

  var autoHide = setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => {
      root.removeChild(toast);
    }, 300);
  }, duration);

  toastClose.ontouchend = 
    toastClose.onclick = () => {
      toast.classList.remove('toast-show');
      setTimeout(() => {
        root.removeChild(toast);
        clearTimeout(autoHide);
      }, 300);
    }
}

