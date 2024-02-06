document.addEventListener("DOMContentLoaded", () => {
	const $ = document.querySelector.bind(document);
	const $$ = document.querySelectorAll.bind(document);

	// handle script / noscript
	const themeScript = document.createElement("link");
	themeScript.rel = "stylesheet";
	themeScript.href = "/styles/theme-script.css";
	$("head").append(themeScript);

	$("#jsonly").remove();

	const body = $("body");
	const themeSelector = $("#theme-selector");

	function changeTheme(theme) {
		if (theme == "day") {
			body.classList.remove("night");
			body.classList.add("day");
			themeSelector.textContent = " Theme";
			window.localStorage.setItem("theme", "day");
		} else {
			body.classList.add("night");
			body.classList.remove("day");
			themeSelector.textContent = " Theme";
			window.localStorage.setItem("theme", "night");
		}
		for (const ele of $$("[data-themeable='true']")) {
			if (ele.tagName == "IMG") {
				ele.src = ele.dataset.src.replace("$theme", theme);
			}
		}
	}

	if (window.localStorage.getItem("theme") == "day") {
		changeTheme("day");
	} else if (window.localStorage.getItem("theme") == "night") {
		changeTheme("night");
	} else {
		changeTheme(window.matchMedia("(prefers-color-scheme: dark)") ? "night" : "day")
	}

	themeSelector.addEventListener("click", () => {
		if (body.classList.contains("night")) {
			changeTheme("day");
		} else {
			changeTheme("night");
		}
	});
});
