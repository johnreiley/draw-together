// set listeners for the drawer
(function() {
  var tools = document.querySelector('#tools');
  var toolsToggle = document.querySelector('#toggle-tools-btn');

  toolsToggle.onclick = () => {
    tools.classList.toggle('open');
  }
})();