import { Component, } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, EMPTY, filter, map, Observable, startWith, Subject } from 'rxjs';

import { ProductCategory } from '../product-categories/product-category';
import { ProductCategoryService } from '../product-categories/product-category.service';

import { Product } from './product';
import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent {
  pageTitle = 'Product List';

  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();
  // Two options to set initial values:
  // 1)
  // We can use BehaviorSubject (initialValue) must be specified
  // and the categorySelectedAction$ doesn't need a pipe startWith()
  // Use this when you need an initial value

  // 2)
  // We can use Subject
  // and the categorySelectedAction$ WILL NEED  a 
  //    .pipe( 
  //        startWith(initialValue)
  //        )
  categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  products$ = combineLatest([
    this.productService.productsWithAdd$,
    this.categorySelectedAction$

  ])
    .pipe(
      map(([products, selectedCategoryId]) =>
        products.filter(product =>
          selectedCategoryId ? product.categoryId === selectedCategoryId : true
        )),
      catchError(err => {
        this.errorMessageSubject.next(err);
        return EMPTY;
      })
    )


  categories$ = this.productCategoryService.productCategories$
    .pipe(
      catchError(err => {
        this.errorMessageSubject.next(err)
        return EMPTY;
      })
    )



  constructor(private productService: ProductService,
    private productCategoryService: ProductCategoryService) { }




  onAdd(): void {
    this.productService.addProduct();
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}
