import {Component, OnDestroy, OnInit} from '@angular/core';
import {WorkspaceService} from '../../services/workspace.service';
import Folder from '../../models/folder';
import Segment from '../../models/Segment';
import {
  globalFilteredSessions,
  globalHasFilter,
  globalResetFilter, globalSegmentFilter
} from '../command-bar/command-bar.component';
import {Session} from '../../models/session';
import {BehaviorSubject, Subscription} from "rxjs";

export const segmentFilter = new BehaviorSubject<boolean>(false);

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})

export class SideBarComponent implements OnInit, OnDestroy {

  folders: Folder[];
  segments: Segment[];
  subscription: Subscription;

  constructor(private workspaceService: WorkspaceService) {
    this.folders = this.workspaceService.getFolders();
    this.segments = this.workspaceService.getSegments();
  }

  ngOnInit(): void {
    /* this.subscription = segmentFilter.subscribe(() => {
      console.log('this.segments = ', this.segments);
      this.folders = this.workspaceService.getFolders();
      this.segments = this.workspaceService.getSegments();
    }); */
  }

  resetFilters() {
    globalFilteredSessions.next(this.workspaceService.sessions);
    globalHasFilter.next(false);
    globalResetFilter.next(true);
  }

  showOnlyPinned() {
    globalFilteredSessions.next(this.workspaceService.sessions.filter((s: Session) => this.workspaceService.getWorkspace().pinned.indexOf(s.sessionId) !== -1));
  }

  applySegmentFilter(segment: Segment, event) {
    event.preventDefault();
    event.stopPropagation();
    console.log(segment);
    //globalFilterGroup.next(segment.filterGroup);
    globalSegmentFilter.next(segment);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  deleteSegment(segment: Segment, event) {
    event.preventDefault();
    event.stopPropagation();
    this.workspaceService.removeSegment(segment);
  }
}
