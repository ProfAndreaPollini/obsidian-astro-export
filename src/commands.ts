import fs from "fs/promises";
import { copyFileSync } from "fs";
import path from "path";
import { fromMarkdown } from "mdast-util-from-markdown";
import getReadingTime from "reading-time";
import { toMarkdown } from "mdast-util-to-markdown";
import matter from "gray-matter";
import { AstroPublishSettings } from "./config";
import { visit } from "unist-util-visit";
import AstroPublishPlugin from "./main";
import { Link } from "mdast-util-from-markdown/lib";



export const processFile = async (
	filename: string,
	plugin: AstroPublishPlugin
) => {
	const settings = plugin.settings;
	console.log(path.normalize(filename));
	console.log(`plugin: ${plugin}`);
	console.log(`app: ${plugin.app}`);
	console.log(`settings: ${settings}`);
	const doc = await fs.readFile(filename);

	const { data: frontmatter, content } = matter(doc);
	const tree = fromMarkdown(content);

	const readingTime = Math.ceil(getReadingTime(content).minutes);

	const children = tree.children.filter(
		(x) => !(x.type === "code" && x.lang === "no")
	);

	frontmatter.readingTime = readingTime;
	tree.children = children;
	console.log(`frontmatter: ${JSON.stringify(frontmatter)}`);

	console.log(Object.keys(frontmatter).includes(settings.exportProperty),frontmatter[settings.exportProperty])

	if (
		Object.keys(frontmatter).includes(settings.exportProperty) &&
		frontmatter[settings.exportProperty] === true
	) {
		//   console.log(processedDoc)
		//   console.log(frontmatter.tags)
		//   console.log(frontmatter.kind)
		if (
			frontmatter.kind &&
			frontmatter.slug &&
			frontmatter.draft !== true
		) {
			const dir = path.join(settings.outContentFolder, "src", "content");
			const kindDir = path.join(dir, frontmatter.kind);

			const links: Array<{ f: string; node: Link }> = [];

			const MarkdownfileContents = new Map<string, string>();

			for (const f of plugin.app.vault.getMarkdownFiles()) {
				const content = await plugin.app.vault.read(f);
				const { data } = matter(content);
				if (data.slug !== undefined) {
					MarkdownfileContents.set(decodeURI(f.path), data.slug);
				} 
			}

			const relatedProp: string[] = [];
			const relatedTree = fromMarkdown(frontmatter.related || "");
			visit(relatedTree, "link", (node) => {
				console.log(`related link ${node.url}`);
				// node.url = MarkdownfileContents.get(decodeURI(node.url)) || node.url
				// console.log(`-> ${node.url}`)
				const p = MarkdownfileContents.get(decodeURI(node.url));
				if (p) {
					relatedProp.push(p);
				}
			});
			frontmatter.related = relatedProp;

			console.log(MarkdownfileContents);

			visit(tree, "link", (node) => {
				if (node.url === undefined) {
					console.error("NODE UNDEFINED");
				}
				const { url } = node; // absolute path in the vault

				// const content = plugin.app.vault.getAbstractFileByPath(url) as TFile
				// if(content) {
				console.warn(
					`link ${decodeURI(url)} -> ${MarkdownfileContents.get(
						decodeURI(url)
					)}`
				);
				node.url = MarkdownfileContents.get(decodeURI(url)) || url;
				// }
				// if (content) {
				// 	fileContents =  plugin.app.vault.read(content)
				// 	const {data} = matter()
				// 	node.url = data.slug
				// }
			});

			// for (const link of links) {
			// 	const fileContents =  await plugin.app.vault.read(link.f)
			// 	const {data} = matter(fileContents)
			// 	const linkUrl = data.slug
			// 	console.log(`link ${link.f.path} -> ${linkUrl}`)
			// 	link.node.url = linkUrl
			// }

			visit(tree, "image", (node) => {
				console.log(`processing image ${node.url}`);
				// if (node.type === "image") {
				// 	console.log(node)
				// }
				node.title = frontmatter.title;
				if (node.url.startsWith("http") === false) {
					const imageFile = path.join(
						path.dirname(filename),
						node.url
					);
					const imageFileOut = path.join(
						settings.outContentFolder,
						"public",
						node.url
					);
					node.url = "/public/" + node.url;
					console.log(
						`IMAGE COPY ${imageFile} -> ${imageFileOut} with url ${node.url}`
					);
					try {
						copyFileSync(imageFile, imageFileOut);
					} catch (e) {
						console.warn(e);
					}
				}
			});
			await fs.mkdir(kindDir, { recursive: true });
			const file = path.join(kindDir, frontmatter.slug + ".md");
			
			const processedContent = toMarkdown(tree);

			const processedDoc = matter.stringify(
				processedContent,
				frontmatter
			);
			await fs.writeFile(file, processedDoc);
			console.info("exported: ", file);
			console.info("  frontmatter: ", frontmatter);
		}
	}
};
