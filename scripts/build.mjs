// posthtml
import posthtml from "posthtml";
import posthtmlExpressions from "posthtml-expressions";
import { parser as posthtmlParser } from "posthtml-parser";
// markdown-it
import markdownit from "markdown-it";
import mdFrontmatter from "markdown-it-front-matter";
import mdHeaderSections from "markdown-it-header-sections";
import mdAttrs from "markdown-it-attrs";
// general
import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";
import esbuild from "esbuild";
import xml from "xml";
import date from "date-and-time";
import sharp from "sharp";

const md = markdownit({ html: true, linkify: true });
let opts = {};
md.use(mdFrontmatter, (fm) => {
	opts = yaml.parse(fm);
});
md.use(mdHeaderSections);
md.use(mdAttrs);

const images = {};

for (const file of fs.readdirSync("./site/assets/", { recursive: true })) {
	const full = path.join("/assets/", file);

	if (full.endsWith(".png")) {
		const outPath = full.replace(/(.+)\.([^\.]+)$/, "$1.webp");

		const img = sharp(path.join("./site", full));
		const meta = await img.metadata();

		images[full] = {
			path: outPath,
			width: meta.width,
			height: meta.height,
			used: () => {
				img.webp({ lossless: true }).toFile(
					path.join("./out", outPath)
				);
			},
			// options: [],
		};
	} else {
		fs.cpSync(path.join("./site", full), path.join("./out", full));
	}
}

const css = new Set();
css.add("/styles/theme-script.css");
const js = new Set();

const pages = [];
const donePages = new Set();

const meta = JSON.parse(fs.readFileSync("./site/meta.json"));

/**
 *
 * @param {import("posthtml").Node} tree
 */
function posthtmlListFiles(tree) {
	tree.match({ tag: "a" }, (node) => {
		const link = node.attrs.href;
		if (link[0] == "/" && !donePages.has(link)) {
			pages.push(link);
		}
		return node;
	});

	tree.match({ tag: "link" }, (node) => {
		if (node.attrs.rel == "stylesheet") {
			css.add(node.attrs.href);
		}
		return node;
	});

	tree.match({ tag: "script" }, (node) => {
		js.add(node.attrs.src);
		return node;
	});

	tree.match({ tag: "font" }, (node) => {
		return [
			{ tag: "link", attrs: { rel: "preload", href: node.attrs.href, as: "font", crossorigin: true } },
			{
				tag: "style",
				content: `@font-face{font-family:"${node.attrs.family}";src:url("${node.attrs.href}");font-display: swap;}`,
			},
		];
	});
}

/**
 *
 * @param {import("posthtml").Node} tree
 */
function posthtmlIpa(tree) {
	tree.match({ tag: "code" }, (node) => {
		switch (node.attrs.class) {
			case "ipa":
				const map = {
					aɪ: "/aɪ/: 'i' in 'tide'",
					ə: "/ə/: 'a' in 'about'",
					w: "/w/: 'w' in 'wind'",
					b: "/b/: 'b' in 'buy'",
					ɑ: "/ɑ/: 'a' in 'father'",
					v: "/v/: 'v' in 'leave'",
					r: "/r/: 'r' in 'try'",
				};
				const eles = ["/"];
				const str = node.content[0];
				let current = "";
				for (let i = 0; i < str.length; i++) {
					if (str[i] == " ") {
						eles.push(" ");
						continue;
					}
					current += str[i];
					if (map[current] != undefined) {
						eles.push({
							tag: "span",
							attrs: { title: map[current] },
							content: [current],
						});
						current = "";
					}
				}
				if (current != "") {
					throw new Error(`Unknown IPA characters: ${node.content}`);
				}
				eles.push("/");

				return {
					tag: "span",
					attrs: { class: "ipa" },
					content: eles,
				};

			default:
				return node;
		}
	});
}

function posthtmlMetaTags(entry) {
	/**
	 *
	 * @param {import("posthtml").Node} tree
	 */
	return (tree) => {
		tree.match({ tag: "meta-tags" }, (node) => {
			const pairs = [
				["language", meta.language],
				["description", meta.description],
				["keywords", meta.keywords],
				["url", meta.basename + entry],
				["og:title", meta.title],
				["og:type", "website"],
				["og:url", meta.basename + entry],
				["og:locale", meta.language],
				// ["og:site_name", meta.title], // todo
				["og:description", meta.description],
			];

			return pairs.map((v) => ({
				tag: "meta",
				attrs: { name: v[0], content: v[1] },
			}));
		});
	};
}

function posthtmlBlog(entry) {
	/**
	 *
	 * @param {import("posthtml").Node} tree
	 */
	return (tree) => {
		tree.match({ tag: "posts" }, (node) => {
			const dir = path.join("./site", entry, node.attrs.dir);
			const files = fs.readdirSync(dir);

			const posts = [];

			for (const file of files) {
				const d = path.join(dir, file);
				const c = md.render(fs.readFileSync(d, "utf8"));
				const t = fs.readFileSync(
					path.join("./site", entry, node.attrs.template),
					"utf8"
				);

				const name = file.replace(/(.+)\.([^\.]+)$/, "$1");

				if (opts.hidden) continue;
				opts.name = name;
				opts.date = date.parse(opts.date, "DD/MM/YYYY");
				opts.path = path.join(entry, node.attrs.dir, name);
				posts.push(opts);

				renderHTML(entry, t, c, opts).then((result) => {
					fs.mkdirSync(
						path.join("./out", entry, node.attrs.dir, name),
						{ recursive: true }
					);
					fs.writeFileSync(
						path.join(
							"./out",
							entry,
							node.attrs.dir,
							name,
							"index.html"
						),
						result.html
					);
				});
			}

			posts
				.sort((b, a) => date.subtract(b.date, a.date).toMilliseconds())
				.reverse();

			/**
			 * @type {import("xml").XmlObject[]}
			 */
			let items = [];

			for (const post of posts) {
				items.push({
					item: [
						{ title: post.title },
						{ link: meta.basename + post.path },
						{ description: post.caption },
						{
							guid: [
								{ _attr: { isPermaLink: "true" } },
								meta.basename + post.path,
							],
						},
					],
				});
			}

			const xmlStr = xml(
				{
					rss: [
						{ _attr: { version: "2.0" } },
						{
							channel: [
								{ title: meta.title },
								{ link: meta.basename + entry },
								{ description: meta.description },
								{ language: meta.language },
								...items,
							],
						},
					],
				},
				{ declaration: true }
			);

			fs.writeFileSync(path.join("./out", entry, "rss.xml"), xmlStr);

			return posts.map((p) => ({
				tag: "a",
				attrs: { href: p.path },
				content: [p.title],
			}));
		});
	};
}

/**
 *
 * @param {import("posthtml").Node} tree
 */
function posthtmlImages(tree) {
	tree.match({ tag: "img" }, (node) => {
		const img = images[node.attrs.src];
		img.used();
		node.attrs.src = img.path;
		node.attrs.width = img.width;
		node.attrs.height = img.height;
		node.attrs.loading = "lazy";

		return node;
	});
}

/**
 *
 * @param {string} entry
 * @param {string} template
 * @param {string} content
 * @param {any} opts
 * @returns
 */
async function renderHTML(entry, template, content, opts) {
	return posthtml()
		.use(posthtmlExpressions({ locals: { content, ...opts } }))
		.use(posthtmlListFiles)
		.use(posthtmlMetaTags(entry))
		.use(posthtmlIpa)
		.use(posthtmlBlog(entry))
		.use(posthtmlImages)
		.process(template, {
			parser: (html) => {
				return posthtmlParser(html, { recognizeSelfClosing: true });
			},
		});
}

async function entryPoint(entry) {
	if (donePages.has(entry)) return;
	donePages.add(entry);

	let template = "";
	let content = "";
	const indexMd = path.join("./site", entry, "index.md");
	if (fs.existsSync(indexMd)) {
		content = md.render(fs.readFileSync(indexMd, "utf8")).trim();
		template = fs.readFileSync(path.join("./site", opts.template), "utf8");
	} else if (fs.existsSync(path.join("./site", entry, "index.html"))) {
		template = fs.readFileSync(
			path.join("./site", entry, "index.html"),
			"utf8"
		);
		opts = {};
	}

	const result = await renderHTML(entry, template, content, opts);
	fs.mkdirSync(path.join("./out", entry), { recursive: true });
	fs.writeFileSync(path.join("./out", entry, "index.html"), result.html);
}

entryPoint("/");
while (pages.length > 0) {
	entryPoint(pages.pop());
}

for (const file of js) {
	await esbuild.build({
		entryPoints: [path.join("./site", file)],
		outfile: path.join("./out", file),
		bundle: true,
		minify: true,
		sourcemap: true,
		target: "chrome58",
	});
}

for (const file of css) {
	await esbuild.build({
		entryPoints: [path.join("./site", file)],
		outfile: path.join("./out", file),
		bundle: true,
		minify: true,
		sourcemap: true,
		target: "chrome58",
	});
}

console.log(`pages:`, donePages);
console.log(`css:`, css);
console.log(`js:`, js);
