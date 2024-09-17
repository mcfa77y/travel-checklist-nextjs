from typing import List, Tuple

# Write any import statements here

'''
  seatCount = N
  marginSeats = K
  guestCont = M
  guestLocations = S
  
  seatCount = 10
  marginSeats = 1
  guestCount = 2
  guestLocations = [2,6]

  1 2 3 4 5 6 7 8 9 0
  _ S _ _ _ S _ _ _ _ 

'''


def howManyCanFit(startIndex, endIndex, marginSeats) -> int:
    if startIndex >= endIndex:
        return 0
    result = ((endIndex - 1) - startIndex) // marginSeats
    print(startIndex, endIndex, marginSeats, result)
    return result


def clamp(value: int, start: int, end: int) -> int:
    if value < start:
        return start
    if value > end:
        return end
    return value


def getStartEndIndexForAvailableSeats(seatCount: int, seatMargin: int, guestLocations: List[int]) -> List[Tuple[int, int]]:
    guestLocations.sort()
    result = []
    barSet = [1]
    for location in guestLocations:
        barSet.append(clamp(location - seatMargin, 1, seatCount))
        barSet.append(clamp(location + seatMargin, 1, seatCount))
    barSet.append(seatCount)
    print('foo', barSet)

    bar = list(barSet)
    for index, value in enumerate(barSet):
        if index % 2 == 1:
            continue
        if index + 1 < len(bar):
            result.append((value, bar[index + 1]))
    print('result', result)
    return result


def getMaxAdditionalDinersCount(N: int, K: int, M: int, S: List[int]) -> int:
    # Write your code here
    seatCount = N
    marginSeats = K
    guestLocations = S

    rest = 0
    for startIndex, endIndex in getStartEndIndexForAvailableSeats(seatCount, marginSeats, guestLocations):
        rest += howManyCanFit(startIndex, endIndex, marginSeats)

    return rest


N = 5
K = 1
S = [1, N]
M = len(S)

print(getMaxAdditionalDinersCount(N, K, M, S))
