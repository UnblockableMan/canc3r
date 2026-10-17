const sections = document.querySelectorAll(".settings-section");
const buttons = document.querySelectorAll(".settings-side button");
const wispServers = document.querySelectorAll(".wisp-servers button")
const currentWisp = document.getElementById("currentWisp");
const savedWisp = localStorage.getItem("canc3r_wispUrl") ?? "wss://wisp.rhw.one/";
const savedCloak = localStorage.getItem("canc3r_cloak") ?? "";
const savedCloakIcon = localStorage.getItem("canc3r_cloakIcon") ?? "";
const savedCloakTitle = localStorage.getItem("canc3r_cloakTitle") ?? "";

const tabIcon = document.getElementById("tabIcon");
const tabTitle = document.querySelector('title');

const themeLink = document.getElementById('css-theme-link');
const savedTheme = localStorage.getItem('canc3r_theme') ?? 'default';

if (savedCloakIcon || savedCloakTitle) {
    tabIcon.href = savedCloakIcon || tabIcon.href;
    document.title = savedCloakTitle || document.title;
}

function setTabTitle(v) {
    document.title = v;
    localStorage.setItem("canc3r_cloakTitle", v);
}

function setTabIcon(v) {
    tabIcon.href = `https://www.google.com/s2/favicons?domain=${v}&sz=256`;
    localStorage.setItem("canc3r_cloakIcon", tabIcon.href);
}

function applyTheme(t) {
  if (t !== "default") {
    themeLink.href = `/assets/css/themes/${t}.css`;
    localStorage.setItem("canc3r_theme", t);
  } else {
    themeLink.href = `/assets/css/colors.css`;
    localStorage.setItem("canc3r_theme", "default");
  }
}

currentWisp.textContent = savedWisp;

buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
        buttons.forEach((b) => {
            b.classList.remove("active");
        })
        btn.classList.add("active");
    });
})

wispServers.forEach((btn) => {
  btn.addEventListener("click", () => {
    wispServers.forEach((b) => {
      b.classList.remove("active");
    });
    btn.classList.add("active");
  });
});

function settingsNav(section) {
    sections.forEach((sec) => {
        sec.classList.toggle("active", sec.classList.contains(section));
    });
}

function setWispServer(url) {
    localStorage.setItem("canc3r_wispUrl", url);
    currentWisp.textContent = url;
}

function cloakMe(o) {
    switch (o) {
        case "gclassroom":
            tabIcon.href = "/assets/img/cloaks/gclassroom.png";
            document.title = "Google Classroom";
            localStorage.setItem("canc3r_cloakIcon", tabIcon.href);
            localStorage.setItem("canc3r_cloakTitle", document.title);
            break;
        case "gdrive":
            tabIcon.href = "/assets/img/cloaks/gdrive.png";
            document.title = "My Drive - Google Drive";
            localStorage.setItem("canc3r_cloakIcon", tabIcon.href);
            localStorage.setItem("canc3r_cloakTitle", document.title);
            break;
        case "google":
            tabIcon.href = "/assets/img/cloaks/google.png";
            document.title = "Google";
            localStorage.setItem("canc3r_cloakIcon", tabIcon.href);
            localStorage.setItem("canc3r_cloakTitle", document.title);
            break;
        case "edpuzzle":
            tabIcon.href = "/assets/img/cloaks/edpuzzle.png";
            document.title = "Edpuzzle";
            localStorage.setItem("canc3r_cloakIcon", tabIcon.href);
            localStorage.setItem("canc3r_cloakTitle", document.title);
            break;
        case "iready":
            tabIcon.href = "/assets/img/cloaks/iready.png";
            document.title = "i-Ready Login";
            localStorage.setItem("canc3r_cloakIcon", tabIcon.href);
            localStorage.setItem("canc3r_cloakTitle", document.title);
            break;
        case "gmail":
            tabIcon.href = "/assets/img/cloaks/gmail.png";
            document.title = "Gmail";
            localStorage.setItem("canc3r_cloakIcon", tabIcon.href);
            localStorage.setItem("canc3r_cloakTitle", document.title);
            break;
        case "blooket":
            tabIcon.href = "/assets/img/cloaks/blooket.png";
            document.title = "Blooket - Fun Learning Games for Students";
            localStorage.setItem("canc3r_cloakIcon", tabIcon.href);
            localStorage.setItem("canc3r_cloakTitle", document.title);
            break;
        case "kahoot":
            tabIcon.href = "/assets/img/cloaks/kahoot.png";
            document.title = "Kahoot! | Learning Games | Make Learning Awesome!";
            localStorage.setItem("canc3r_cloakIcon", tabIcon.href);
            localStorage.setItem("canc3r_cloakTitle", document.title);
            break;
        case "none":
            tabIcon.href = "/image.png";
            document.title = "C3";
            localStorage.setItem("canc3r_cloakIcon", tabIcon.href);
            localStorage.setItem("canc3r_cloakTitle", document.title);
            break;
    }
}