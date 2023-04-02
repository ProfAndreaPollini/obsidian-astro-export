import fs from 'fs/promises'
import path from "path"
import {fromMarkdown} from 'mdast-util-from-markdown'
import getReadingTime from 'reading-time';
import {toMarkdown} from 'mdast-util-to-markdown'
import matter from 'gray-matter';
import { AstroPublishSettings } from './config';
import {visit} from 'unist-util-visit'




export const processFile = async (filename:string,settings: AstroPublishSettings) => {
  console.log(path.normalize(filename))
  const doc = await fs.readFile(filename)

  const {data:frontmatter,content} = matter(doc)
  const tree = fromMarkdown(content)


  const readingTime = Math.ceil(getReadingTime(content).minutes)

  const children = tree.children.filter(x => !(x.type === "code" && x.lang === "no"))

  frontmatter.readingTime = readingTime
  tree.children = children
  const processedContent = toMarkdown(tree)

  const processedDoc = matter.stringify(processedContent, frontmatter)
  console.log(processedDoc)
  console.log(frontmatter.tags)
  console.log(frontmatter.kind)
  if (frontmatter.kind && frontmatter.slug && frontmatter.draft !== true) {
	const dir = path.join(settings.outContentFolder,"src",'content')
    const kindDir = path.join(dir, frontmatter.kind)
    await fs.mkdir(kindDir, {recursive: true})
    const file = path.join(kindDir, frontmatter.slug + '.md')
    console.log("OUT",file)
    await fs.writeFile(file, processedDoc)
	visit(tree, (node) => {
		if (node.type === "image") {
			console.log(node)
		}
	  }) 
  }

}
