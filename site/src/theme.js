document.addEventListener("DOMContentLoaded", () => {
	const $ = (ele) => document.querySelector(ele);
	const $$ = (ele) => document.querySelectorAll(ele);

	// handle script / noscript
	$("#theme-script").attributes.removeNamedItem("disabled");

	const body = $("body");
	const themeSelector = $("#theme-selector");

	function changeTheme(theme) {
		if (theme == "day") {
			body.classList.remove("night");
			body.classList.add("day");
			themeSelector.textContent = " Theme";
			themeSelector.ariaLabel = "Switch to dark theme";
			window.localStorage.setItem("theme", "day");
		} else {
			body.classList.add("night");
			body.classList.remove("day");
			themeSelector.textContent = " Theme";
			themeSelector.ariaLabel = "Switch to light theme";
			window.localStorage.setItem("theme", "night");
		}
		// for (const ele of $$("[data-themeable='true']")) {
		// 	if (ele.tagName == "IMG") {
		// 		ele.src = ele.dataset.src.replace("$theme", theme);
		// 	}
		// }
	}

	const storageTheme = window.localStorage.getItem("theme");
	if (storageTheme == "day") {
		changeTheme("day");
	} else if (storageTheme == "night") {
		changeTheme("night");
	} else {
		changeTheme(
			window.matchMedia("(prefers-color-scheme: dark)") ? "night" : "day"
		);
	}

	themeSelector.addEventListener("click", () => {
		if (body.classList.contains("night")) {
			changeTheme("day");
		} else {
			changeTheme("night");
		}
	});
});
