import fs from 'fs/promises'
import {copyFileSync} from "fs"
import path from "path"
import {fromMarkdown} from 'mdast-util-from-markdown'
import getReadingTime from 'reading-time';
import {toMarkdown} from 'mdast-util-to-markdown'
import matter from 'gray-matter';
import { AstroPublishSettings } from './config';
import {visit} from 'unist-util-visit'
import AstroPublishPlugin from './main';




export const processFile = async (filename:string,plugin: AstroPublishPlugin) => {
  const settings = plugin.settings
  console.log(path.normalize(filename))
  console.log(`plugin: ${plugin}`)
  console.log(`app: ${plugin.app}`)
  console.log(`settings: ${settings}`)
  const doc = await fs.readFile(filename)

  const {data:frontmatter,content} = matter(doc)
  const tree = fromMarkdown(content)


  const readingTime = Math.ceil(getReadingTime(content).minutes)

  const children = tree.children.filter(x => !(x.type === "code" && x.lang === "no"))

  frontmatter.readingTime = readingTime
  tree.children = children

//   console.log(processedDoc)
//   console.log(frontmatter.tags)
//   console.log(frontmatter.kind)
  if (frontmatter.kind && frontmatter.slug && frontmatter.draft !== true) {
	const dir = path.join(settings.outContentFolder,"src",'content')
    const kindDir = path.join(dir, frontmatter.kind)
    
	visit(tree,"image", (node) => {
		console.log(`processing image ${node.url}`)
		// if (node.type === "image") {
		// 	console.log(node)
		// }
		node.title = frontmatter.title
		if (node.url.startsWith("http") === false) {
			const imageFile = path.join(path.dirname(filename),node.url)
			const imageFileOut = path.join(settings.outContentFolder,"public",node.url)
			node.url = "/public/"+ node.url
			console.log(`IMAGE COPY ${imageFile} -> ${imageFileOut} with url ${node.url}`)
		
			try {
				copyFileSync(imageFile,imageFileOut)
			
		} catch (e) {console.warn(e)}
			
		}
	  }) 
	  await fs.mkdir(kindDir, {recursive: true})
    const file = path.join(kindDir, frontmatter.slug + '.md')
    console.log("OUT",file)
	const processedContent = toMarkdown(tree)

	const processedDoc = matter.stringify(processedContent, frontmatter)
    await fs.writeFile(file, processedDoc)
  }
}
