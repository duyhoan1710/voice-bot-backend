import { EReleaseStatus } from '@src/common/enums';
import { CategoryService } from './../category/category.service';
import { ChapterService } from './../chapter/chapter.service';
import { HistoryService } from './../history/history.service';
import { ECensorshipStatus } from './../../common/enums/index';
import { CategoryRepository } from './../category/category.repository';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { BookRepository } from './repository/book.repository';
import { BookCategoryRepository } from './repository/bookCategory.repository';
/* eslint-disable @typescript-eslint/no-var-requires */
const cheerio = require('cheerio');
const axios = require('axios');

@Injectable()
export class BookService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly bookRepository: BookRepository,
    private readonly bookCategoryRepository: BookCategoryRepository,
    private readonly historyService: HistoryService,
    private readonly chapterService: ChapterService,
    private readonly categoryService: CategoryService,
  ) {}

  async getList() {
    return this.bookRepository
      .createQueryBuilder('book')
      .leftJoin('book.author', 'author')
      .leftJoin('book.bookCategory', 'bookCategory')
      .leftJoin('bookCategory.category', 'category')
      .loadRelationCountAndMap('book.countChapter', 'book.chapters')
      .loadRelationCountAndMap('book.countView', 'book.histories')
      .loadRelationCountAndMap('book.countLike', 'book.likes')
      .loadRelationCountAndMap('book.countDownload', 'book.downloads')
      .select([
        'book.id',
        'book.name',
        'book.description',
        'book.image',
        'book.is_vip',
        'book.release_status',
        'author.id',
        'author.full_name',
        'bookCategory.category_id',
        'category.id',
        'category.name',
      ])
      .getMany();
  }

  async getOne({ userId, bookId }) {
    const book = await this.bookRepository
      .createQueryBuilder('book')
      .leftJoin('book.author', 'author')
      .leftJoin('book.chapters', 'chapters')
      .leftJoin('book.bookCategory', 'bookCategory')
      .leftJoin('bookCategory.category', 'category')
      .loadRelationCountAndMap('book.countChapter', 'book.chapters')
      .loadRelationCountAndMap('book.countView', 'book.histories')
      .loadRelationCountAndMap('book.countLike', 'book.likes')
      .loadRelationCountAndMap('book.countDownload', 'book.downloads')
      .select([
        'book.id',
        'book.name',
        'book.image',
        'book.description',
        'book.is_vip',
        'book.release_status',
        'author.id',
        'author.full_name',
        'chapters.id',
        'chapters.name',
        'bookCategory.category_id',
        'category.id',
        'category.name',
      ])
      .where('book.id = :bookId', { bookId })
      .getOne();

    if (!book) {
      throw new HttpException(
        {
          context: '',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.historyService.update({
      userId,
      bookId,
      chapterId: null,
    });

    return book;
  }

  async create({
    name,
    description,
    image,
    releaseStatus,
    isVisible,
    isVip,
    authorId,
    categoryIds,
    chapters,
  }) {
    const book = await this.bookRepository.findOne({
      name,
    });
    let newBook: any = {};

    if (!book) {
      newBook = await this.bookRepository.save({
        name,
        description,
        image,
        release_status: releaseStatus,
        censorship_status: ECensorshipStatus.PENDING,
        is_vip: isVip,
        is_visible: isVisible,
        author_id: authorId,
      });
    }

    const categories = await this.categoryRepository.findByIds(categoryIds);

    if (categoryIds.length !== categories.length) {
      return new HttpException(
        {
          context: '',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.bookCategoryRepository.save(
      categoryIds.map((categoryId: number) => ({
        category_id: categoryId,
        book_id: newBook.id || book.id,
      })),
    );

    await this.chapterService.create({
      bookId: newBook.id || book.id,
      chapters,
    });
  }

  async update({
    bookId,
    name,
    description,
    releaseStatus,
    isVisible,
    categoryIds,
  }) {
    if (categoryIds) {
      await this.bookCategoryRepository.delete({
        book_id: bookId,
      });

      await this.bookCategoryRepository.save(
        categoryIds.map((categoryId) => ({
          category_id: categoryId,
          book_id: bookId,
        })),
      );
    }

    await this.bookRepository.update(
      { id: bookId },
      {
        name,
        description,
        is_visible: isVisible,
        release_status: releaseStatus,
      },
    );
  }

  async crawl({ userId }) {
    try {
      const url = 'https://www.sachhayonline.com';
      const data = [];

      const getChapterDetail = async ({ href }) => {
        const response = await axios(`${url}/tua-sach/${href}`);
        const $ = cheerio.load(response.data);
        $.html();

        const content = $('.reading-white p');
        let chapterContent = '';

        Object.keys(content).forEach((key) => {
          try {
            chapterContent += content[key].children[0].data += '\n';
          } catch (error) {
            // chapterContent += el.children[0].data += '\n';
          }
        });

        return chapterContent;
      };

      const getBookDetail = async (response) => {
        const $ = cheerio.load(response.data);
        $.html();

        const category = $('.nav a')[1].children[0].data;
        const book = $('.inner > a > h3')[0].children[0].data;
        const description = $('.inner > p')[0]?.children[0]?.data;
        const image = $('.image > a > img')[0].attribs.src;
        const chapters = [];
        const content = $('.default > li');

        for (let i = 0; i < Object.keys(content).length; i++) {
          // if (i > 0 && i < 10) {
          try {
            const chapterContent = await getChapterDetail({
              href: content[Object.keys(content)[i]].children[0].attribs.href,
            });

            chapters.push({
              name: content[Object.keys(content)[i]].children[0].attribs.title,
              content: chapterContent,
            });
          } catch (error) {}
          // }
        }

        data.push({
          category,
          book,
          description,
          image: `${url}/${image.substring(3)}`,
          chapters,
        });
      };

      await axios(url).then(async (response) => {
        const $ = cheerio.load(response.data);
        $.html();

        const books = $('.box > .image > a');

        for (let i = 0; i < Object.keys(books).length; i++) {
          if (i === 14) {
            try {
              await axios(
                `${url}/${books[Object.keys(books)[i]].attribs.href}`,
              ).then(getBookDetail);
            } catch (error) {
              console.log(error);
            }
          }
        }
      });

      for (let i = 0; i < data.length; i++) {
        const { book, category, description, chapters, image } = data[i];

        const findCategory = await this.categoryService.getOne({
          name: category,
        });

        if (!findCategory) {
          const newCategory = await this.categoryService.create({
            name: category,
          });

          await this.create({
            name: book,
            description,
            image,
            releaseStatus: EReleaseStatus.RELEASED,
            isVisible: true,
            isVip: false,
            authorId: userId,
            categoryIds: [newCategory.id],
            chapters,
          });
        } else {
          await this.create({
            name: book,
            description,
            image,
            releaseStatus: EReleaseStatus.RELEASED,
            isVisible: true,
            isVip: false,
            authorId: userId,
            categoryIds: [findCategory.id],
            chapters,
          });
        }
      }
    } catch (e) {
      new HttpException(
        {
          context: '',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
