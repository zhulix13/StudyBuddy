import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import Image from '@tiptap/extension-image'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Underline from '@tiptap/extension-underline'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'

const extensions = [
  StarterKit,
  Placeholder,
  Typography,
  Highlight,
  TaskList,
  TaskItem,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-blue-600 hover:text-blue-800 underline',
    },
  }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Table.configure({ 
    resizable: true,
    HTMLAttributes: {
      class: 'border-collapse border border-gray-300 w-full my-4',
    },
  }),
  TableRow.configure({
    HTMLAttributes: {
      class: 'border border-gray-300',
    },
  }),
  TableHeader.configure({
    HTMLAttributes: {
      class: 'border border-gray-300 bg-gray-50 px-4 py-2 font-semibold text-left',
    },
  }),
  TableCell.configure({
    HTMLAttributes: {
      class: 'border border-gray-300 px-4 py-2',
    },
  }),
  Image.configure({
    HTMLAttributes: {
      class: 'max-w-full h-auto rounded-lg my-4',
    },
  }),
  HorizontalRule.configure({
    HTMLAttributes: {
      class: 'my-6 border-gray-300',
    },
  }),
  Subscript,
  Superscript,
  Underline,
  Color,
  TextStyle,
  FontFamily,
]

export const renderTipTapContent = (content: any): string => {
  try {
    if (!content) return '<p>No content available</p>'
    
    return generateHTML(content, extensions)
  } catch (e) {
    console.error('Error rendering TipTap content:', e)
    return '<p class="text-red-500">Error rendering content</p>'
  }
}

export const useTipTapRenderer = () => {
  return { renderTipTapContent }
}
